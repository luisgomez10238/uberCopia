import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/SessionContext';
import FormField from '../components/Registro/FormField';
import DropdownField from '../components/Registro/DropdownField';
import ImagePickerField from '../components/Registro/ImagePickerField';
import { GENEROS, IDIOMAS } from '../constants/options';
import { obtenerError } from '../utils/validators';
import { guardarIdioma } from '../utils/preferences';
import { actualizarPerfil } from '../services/profileService';

// AI-assisted: see docs/AI_LOG.md #7
const ETIQUETA_CATEGORIA = { economy: 'Económico', xl: 'XL', premium: 'Premium' };

// 'YYYY-MM-DD' -> 'DD/MM/YYYY'
const verFecha = (texto) => {
  if (!texto) return '—';
  const [anio, mes, dia] = texto.split('-');
  return `${dia}/${mes}/${anio}`;
};

// Estado de un documento según su fecha de vencimiento
const estadoVencimiento = (texto) => {
  if (!texto) return null;
  const [anio, mes, dia] = texto.split('-').map(Number);
  const vence = new Date(anio, mes - 1, dia);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dias = Math.round((vence - hoy) / 86400000);

  if (dias <= 0) return { texto: 'Vencido', color: '#D93025' };
  if (dias <= 30) return { texto: 'Vence pronto', color: '#E8A317' };
  return { texto: 'Vigente', color: '#1E8E3E' };
};

const Fila = ({ etiqueta, valor }) => (
  <View style={styles.fila}>
    <Text style={styles.filaEtiqueta}>{etiqueta}</Text>
    <Text style={styles.filaValor}>{valor || '—'}</Text>
  </View>
);

const FilaDocumento = ({ etiqueta, documento }) => {
  const estado = estadoVencimiento(documento?.expiresAt);
  return (
    <View style={styles.fila}>
      <View style={styles.filaTextos}>
        <Text style={styles.filaEtiqueta}>{etiqueta}</Text>
        <Text style={styles.filaValor}>
          {documento ? `Vence: ${verFecha(documento.expiresAt)}` : 'No registrado'}
        </Text>
      </View>
      {estado ? (
        <Text style={[styles.chip, { color: estado.color, borderColor: estado.color }]}>
          {estado.texto}
        </Text>
      ) : null}
    </View>
  );
};

export default function PerfilScreen() {
  const { usuario, conductor, cerrarSesion } = useSession();
  const uid = usuario.uid;

  const [nombre, setNombre] = useState(conductor?.fullName ?? '');
  const [telefono, setTelefono] = useState(conductor?.phone ?? '');
  const [genero, setGenero] = useState(conductor?.gender ?? '');
  const [idioma, setIdioma] = useState(conductor?.language ?? 'es');
  const [fotoNueva, setFotoNueva] = useState(null);

  const [tocados, setTocados] = useState({});
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errorGuardado, setErrorGuardado] = useState('');

  // Se reutilizan las mismas reglas del registro
  const parcial = { personal: { nombre, telefono, genero, idioma }, vehiculo: {} };
  const errores = {
    nombre: obtenerError('personal', 'nombre', parcial),
    telefono: obtenerError('personal', 'telefono', parcial),
    genero: obtenerError('personal', 'genero', parcial),
    idioma: obtenerError('personal', 'idioma', parcial),
  };
  const hayErrores = Object.values(errores).some(Boolean);

  const hayCambios =
    nombre.trim() !== (conductor?.fullName ?? '') ||
    telefono !== (conductor?.phone ?? '') ||
    genero !== (conductor?.gender ?? '') ||
    idioma !== (conductor?.language ?? 'es') ||
    !!fotoNueva;

  const ver = (campo) => (intentado || tocados[campo] ? errores[campo] : null);
  const tocar = (campo) => setTocados((t) => ({ ...t, [campo]: true }));
  const editado = () => setMensaje('');

  const guardar = async () => {
    setIntentado(true);
    setMensaje('');
    setErrorGuardado('');
    if (hayErrores) return;

    setGuardando(true);
    try {
      await actualizarPerfil(uid, { nombre, telefono, genero, idioma, fotoNueva });
      await guardarIdioma(idioma);
      setFotoNueva(null);
      setIntentado(false);
      setMensaje('Cambios guardados');
    } catch (e) {
      setErrorGuardado(e.message || 'No se pudieron guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  const vehiculo = conductor?.vehicle;
  const docs = conductor?.documents;
  const aprobado = conductor?.status === 'approved';

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
      {/* Encabezado */}
      <View style={styles.encabezado}>
        {conductor?.profilePhotoUrl ? (
          <Image source={{ uri: conductor.profilePhotoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarVacio]}>
            <Ionicons name="person" size={34} color="#FFFFFF" />
          </View>
        )}
        <View style={styles.encabezadoTextos}>
          <Text style={styles.nombre}>{conductor?.fullName}</Text>
          <Text style={styles.correo}>{conductor?.email}</Text>
          <Text style={[styles.chipEstado, { backgroundColor: aprobado ? '#1E8E3E' : '#E8A317' }]}>
            {aprobado ? 'Cuenta aprobada' : 'Pendiente de aprobación'}
          </Text>
        </View>
      </View>

      {/* Datos editables */}
      <View style={styles.tarjeta}>
        <View style={styles.tituloFila}>
          <Ionicons name="create-outline" size={22} color="#1769D2" />
          <Text style={styles.titulo}>Mis datos</Text>
        </View>

        <ImagePickerField
          label="Foto de perfil"
          value={fotoNueva || conductor?.profilePhotoUrl || null}
          onChange={(uri) => {
            setFotoNueva(uri);
            editado();
          }}
        />

        <FormField
          label="Nombre completo"
          value={nombre}
          onChangeText={(t) => {
            setNombre(t);
            editado();
          }}
          onBlur={() => tocar('nombre')}
          error={ver('nombre')}
          autoCapitalize="words"
          maxLength={50}
        />

        <FormField
          label="Número de celular"
          value={telefono}
          onChangeText={(t) => {
            setTelefono(t.replace(/\D/g, ''));
            editado();
          }}
          onBlur={() => tocar('telefono')}
          error={ver('telefono')}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <DropdownField
          label="Género"
          value={genero}
          onValueChange={(v) => {
            setGenero(v);
            editado();
          }}
          options={GENEROS}
          error={ver('genero')}
        />

        <Fila etiqueta="Documento de identidad" valor={conductor?.documentId} />
        <Fila etiqueta="Fecha de nacimiento" valor={verFecha(conductor?.birthDate)} />
        <Text style={styles.nota}>
          El documento, el correo y la fecha de nacimiento no se pueden cambiar desde la app.
        </Text>
      </View>

      {/* Configuración */}
      <View style={styles.tarjeta}>
        <View style={styles.tituloFila}>
          <Ionicons name="settings-outline" size={22} color="#1769D2" />
          <Text style={styles.titulo}>Configuración</Text>
        </View>

        <DropdownField
          label="Idioma"
          value={idioma}
          onValueChange={(v) => {
            setIdioma(v);
            editado();
          }}
          options={IDIOMAS}
          error={ver('idioma')}
        />
      </View>

      {errorGuardado ? <Text style={styles.errorTexto}>{errorGuardado}</Text> : null}
      {mensaje ? <Text style={styles.exitoTexto}>{mensaje}</Text> : null}

      <Pressable
        style={[styles.boton, (!hayCambios || guardando) && styles.botonDeshabilitado]}
        onPress={guardar}
        disabled={!hayCambios || guardando}
      >
        {guardando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.textoBoton}>Guardar cambios</Text>
        )}
      </Pressable>

      {/* Vehículo */}
      <View style={styles.tarjeta}>
        <View style={styles.tituloFila}>
          <Ionicons name="car-sport-outline" size={22} color="#1769D2" />
          <Text style={styles.titulo}>Mi vehículo</Text>
        </View>

        {vehiculo?.photoUrl ? (
          <Image source={{ uri: vehiculo.photoUrl }} style={styles.fotoVehiculo} />
        ) : null}

        <Fila etiqueta="Categoría" valor={ETIQUETA_CATEGORIA[vehiculo?.category]} />
        <Fila etiqueta="Placa" valor={vehiculo?.plate} />
        <Fila
          etiqueta="Marca y modelo"
          valor={vehiculo ? `${vehiculo.brand} ${vehiculo.model}` : ''}
        />
        <Fila etiqueta="Año" valor={vehiculo?.year ? String(vehiculo.year) : ''} />
        <Fila etiqueta="Color" valor={vehiculo?.color} />
        <Fila
          etiqueta="Capacidad"
          valor={vehiculo?.capacity ? `${vehiculo.capacity} pasajeros` : ''}
        />
      </View>

      {/* Documentos */}
      <View style={styles.tarjeta}>
        <View style={styles.tituloFila}>
          <Ionicons name="document-text-outline" size={22} color="#1769D2" />
          <Text style={styles.titulo}>Mis documentos</Text>
        </View>

        <FilaDocumento etiqueta="Licencia de conducción" documento={docs?.license} />
        <FilaDocumento etiqueta="SOAT" documento={docs?.soat} />
        {docs?.technicalReview ? (
          <FilaDocumento etiqueta="Revisión técnico-mecánica" documento={docs.technicalReview} />
        ) : null}

        <Fila etiqueta="Cuenta de Mercado Pago" valor={conductor?.mercadoPagoEmail} />
        <Fila
          etiqueta="Comisión aceptada"
          valor={
            conductor?.acceptedCommissionRate != null
              ? `${Math.round(conductor.acceptedCommissionRate * 100)} %`
              : ''
          }
        />
      </View>

      {/* Sesión */}
      <Pressable style={styles.botonSalir} onPress={cerrarSesion}>
        <Ionicons name="log-out-outline" size={20} color="#D93025" />
        <Text style={styles.textoSalir}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F2F6FC' },
  contenido: { padding: 16, paddingBottom: 40 },

  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#145BB8',
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#0F4A99' },
  avatarVacio: { justifyContent: 'center', alignItems: 'center' },
  encabezadoTextos: { flex: 1 },
  nombre: { fontSize: 19, fontWeight: 'bold', color: '#FFFFFF' },
  correo: { fontSize: 13, color: '#E5F0FF', marginTop: 2, marginBottom: 8 },
  chipEstado: {
    alignSelf: 'flex-start',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },

  tarjeta: {
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4EBF5',
  },
  tituloFila: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 15 },
  titulo: { fontSize: 16, fontWeight: 'bold', color: '#172B4D' },

  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E4EBF5',
  },
  filaTextos: { flex: 1 },
  filaEtiqueta: { fontSize: 13, color: '#718096' },
  filaValor: { fontSize: 14, fontWeight: '600', color: '#172B4D', textAlign: 'right' },
  chip: {
    fontSize: 12,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 9,
  },
  nota: { fontSize: 12, color: '#718096', lineHeight: 18, marginTop: 8 },
  fotoVehiculo: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#E4EBF5',
  },

  errorTexto: { fontSize: 13, color: '#D93025', textAlign: 'center', marginBottom: 10 },
  exitoTexto: { fontSize: 13, color: '#1E8E3E', textAlign: 'center', marginBottom: 10 },
  boton: {
    backgroundColor: '#145BB8',
    minHeight: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  botonDeshabilitado: { backgroundColor: '#A9B8CE' },
  textoBoton: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  botonSalir: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#D93025',
    borderRadius: 14,
    minHeight: 50,
    marginTop: 4,
  },
  textoSalir: { color: '#D93025', fontSize: 15, fontWeight: 'bold' },
});