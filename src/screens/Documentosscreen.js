import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegistration } from '../context/RegistrationContext';
import FormField from '../components/FormField';
import DateField from '../components/DateField';
import ImagePickerField from '../components/ImagePickerField';
import CheckboxField from '../components/CheckboxField';
import { requiereRevision } from '../utils/validators';
import { PRICING } from '../config/pricing';
import { registrarConductor } from '../services/driverService';

export default function DocumentosScreen() {
  const {
    registro,
    errores,
    seccionValida,
    formularioValido,
    actualizarDocumentos,
    tocarCampo,
    limpiarRegistro,
  } = useRegistration();

  const { documentos, vehiculo } = registro;
  const error = errores.documentos;
  const aplicaRevision = requiereRevision(vehiculo.anio);
  const comision = Math.round(PRICING.commissionRate * 100);

  // Las fechas de vencimiento deben ser posteriores a hoy: se parte de mañana
  const manana = useMemo(() => {
    const fecha = new Date();
    fecha.setHours(0, 0, 0, 0);
    fecha.setDate(fecha.getDate() + 1);
    return fecha;
  }, []);

  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const [registroEnviado, setRegistroEnviado] = useState(false);

  const puedeEnviar = formularioValido && !enviando;

  const faltan = [];
  if (!seccionValida.personal) faltan.push('Datos personales');
  if (!seccionValida.vehiculo) faltan.push('Vehículo');
  if (!seccionValida.documentos) faltan.push('Documentos y pagos');

  const manejarEnvio = async () => {
    setEnviando(true);
    setErrorEnvio('');
    try {
      await registrarConductor(registro, registro.personal.contrasena);
      limpiarRegistro(); // borra la contraseña de la memoria
      setRegistroEnviado(true);
    } catch (e) {
      setErrorEnvio(e.message);
    } finally {
      setEnviando(false);
    }
  };

  if (registroEnviado) {
    return (
      <View style={styles.exito}>
        <Ionicons name="checkmark-circle" size={72} color="#1E8E3E" />
        <Text style={styles.exitoTitulo}>¡Registro enviado!</Text>
        <Text style={styles.exitoTexto}>
          Tu cuenta quedó en estado "Pendiente de aprobación". No podrás
          ponerte Disponible hasta que sea aprobada.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.encabezado}>
        <View style={styles.iconoEncabezado}>
          <Ionicons name="document-text-outline" size={25} color="#FFFFFF" />
        </View>
        <Text style={styles.titulo}>Documentos y pagos</Text>
        <Text style={styles.subtitulo}>
          Sube tus documentos vigentes y el correo donde recibirás tus pagos.
        </Text>
      </View>

      {/* Licencia */}
      <View style={styles.tarjeta}>
        <View style={styles.encabezadoSeccion}>
          <Ionicons name="card-outline" size={22} color="#1769D2" />
          <Text style={styles.tituloSeccion}>Licencia de conducción</Text>
        </View>

        <FormField
          label="Número de licencia"
          value={documentos.licenciaNumero}
          onChangeText={(texto) => actualizarDocumentos('licenciaNumero', texto)}
          onBlur={() => tocarCampo('documentos', 'licenciaNumero')}
          error={error.licenciaNumero}
          keyboardType="numeric"
          maxLength={15}
          placeholder="6 a 15 dígitos"
        />

        <DateField
          label="Fecha de vencimiento"
          value={documentos.licenciaVencimiento}
          onChange={(fecha) => actualizarDocumentos('licenciaVencimiento', fecha)}
          error={error.licenciaVencimiento}
          placeholder="Selecciona la fecha de vencimiento"
          fechaPorDefecto={manana}
          minimumDate={manana}
          maximumDate={null}
        />

        <ImagePickerField
          label="Foto de la licencia"
          value={documentos.licenciaFoto}
          onChange={(uri) => actualizarDocumentos('licenciaFoto', uri)}
          error={error.licenciaFoto}
        />
      </View>

      {/* SOAT */}
      <View style={styles.tarjeta}>
        <View style={styles.encabezadoSeccion}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#1769D2" />
          <Text style={styles.tituloSeccion}>SOAT</Text>
        </View>

        <DateField
          label="Fecha de vencimiento"
          value={documentos.soatVencimiento}
          onChange={(fecha) => actualizarDocumentos('soatVencimiento', fecha)}
          error={error.soatVencimiento}
          placeholder="Selecciona la fecha de vencimiento"
          fechaPorDefecto={manana}
          minimumDate={manana}
          maximumDate={null}
        />

        <ImagePickerField
          label="Foto del SOAT"
          value={documentos.soatFoto}
          onChange={(uri) => actualizarDocumentos('soatFoto', uri)}
          error={error.soatFoto}
        />
      </View>

      {/* Revisión técnico-mecánica: solo si aplica según el año */}
      <View style={styles.tarjeta}>
        <View style={styles.encabezadoSeccion}>
          <Ionicons name="build-outline" size={22} color="#1769D2" />
          <Text style={styles.tituloSeccion}>Revisión técnico-mecánica</Text>
        </View>

        {aplicaRevision ? (
          <>
            <DateField
              label="Fecha de vencimiento"
              value={documentos.revisionVencimiento}
              onChange={(fecha) => actualizarDocumentos('revisionVencimiento', fecha)}
              error={error.revisionVencimiento}
              placeholder="Selecciona la fecha de vencimiento"
              fechaPorDefecto={manana}
              minimumDate={manana}
              maximumDate={null}
            />

            <ImagePickerField
              label="Foto de la revisión técnico-mecánica"
              value={documentos.revisionFoto}
              onChange={(uri) => actualizarDocumentos('revisionFoto', uri)}
              error={error.revisionFoto}
            />
          </>
        ) : (
          <Text style={styles.nota}>
            No aplica: según el año que registraste en la pestaña Vehículo, aún
            no se exige la revisión técnico-mecánica.
          </Text>
        )}
      </View>

      {/* Pagos */}
      <View style={styles.tarjeta}>
        <View style={styles.encabezadoSeccion}>
          <Ionicons name="wallet-outline" size={22} color="#1769D2" />
          <Text style={styles.tituloSeccion}>Pagos</Text>
        </View>

        <FormField
          label="Correo de la cuenta de Mercado Pago"
          value={documentos.correoMercadoPago}
          onChangeText={(texto) => actualizarDocumentos('correoMercadoPago', texto)}
          onBlur={() => tocarCampo('documentos', 'correoMercadoPago')}
          error={error.correoMercadoPago}
          keyboardType="email-address"
          autoCorrect={false}
          placeholder="correo@dominio.com"
        />

        <Text style={styles.nota}>
          Aquí recibirás tus pagos. La app no guarda números de cuenta bancaria
          ni de tarjeta: los maneja la pasarela de pago.
        </Text>
      </View>

      {/* Términos y comisión */}
      <View style={styles.tarjeta}>
        <CheckboxField
          label={`Acepto los términos y condiciones y que la plataforma cobra una comisión del ${comision} % sobre la tarifa de cada viaje.`}
          value={documentos.aceptaTerminos}
          onChange={(valor) => actualizarDocumentos('aceptaTerminos', valor)}
          error={error.aceptaTerminos}
        />
      </View>

      {/* Enviar */}
      {!puedeEnviar && !enviando ? (
        <Text style={styles.faltan}>Falta completar: {faltan.join(', ')}</Text>
      ) : null}

      {errorEnvio ? <Text style={styles.errorEnvio}>{errorEnvio}</Text> : null}

      <Pressable
        style={[styles.boton, !puedeEnviar && styles.botonDeshabilitado]}
        onPress={manejarEnvio}
        disabled={!puedeEnviar}
      >
        {enviando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.textoBoton}>Enviar registro</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F2F6FC',
  },
  contenido: {
    padding: 16,
    paddingBottom: 35,
  },
  encabezado: {
    backgroundColor: '#145BB8',
    padding: 22,
    borderRadius: 18,
    marginBottom: 18,
  },
  iconoEncabezado: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },
  titulo: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 7,
  },
  subtitulo: {
    fontSize: 14,
    color: '#E5F0FF',
    lineHeight: 21,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4EBF5',
  },
  encabezadoSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 15,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#172B4D',
  },
  nota: {
    fontSize: 13,
    color: '#718096',
    lineHeight: 19,
  },
  faltan: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorEnvio: {
    fontSize: 13,
    color: '#D93025',
    textAlign: 'center',
    marginBottom: 10,
  },
  boton: {
    backgroundColor: '#145BB8',
    minHeight: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#A9B8CE',
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exito: {
    flex: 1,
    backgroundColor: '#F2F6FC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  exitoTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#172B4D',
    marginTop: 14,
    marginBottom: 8,
  },
  exitoTexto: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 21,
  },
});