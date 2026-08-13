import Link from "next/link";

export const metadata = {
  title: "Política de privacidad",
  description:
    "Cómo Nutrionyx trata los datos personales y de salud: responsable, finalidades, subencargados, conservación y derechos RGPD.",
  alternates: { canonical: "/privacidad" },
};

/**
 * Legal document, not UI copy: the text lives here rather than in
 * messages/es.json. Provisional version; the definitive legal text (with
 * the controller's full fiscal identification) ships before commercial
 * launch, mirroring the DPA notice inside the product.
 */

const UPDATED = "10 de agosto de 2026";

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 font-display text-xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <nav className="mx-auto mb-12 max-w-[70ch]">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-ink"
        >
          Nutrionyx
        </Link>
      </nav>
      <article className="mx-auto max-w-[70ch] leading-relaxed [&_p]:mt-3 [&_ul]:mt-3 [&_li]:mt-1.5 [&_li]:list-disc [&_ul]:pl-5">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Política de privacidad
        </h1>
        <p className="text-sm text-ink-subtle">
          Versión provisional · actualizada el {UPDATED}
        </p>

        <H2>1. Responsable y roles</H2>
        <p>
          Nutrionyx es una plataforma para profesionales de la nutrición,
          operada por su fundador. Contacto para cualquier cuestión de
          privacidad: lexsantor@gmail.com.
        </p>
        <p>
          Sobre los datos clínicos de cada paciente, la consulta profesional
          que lo atiende es la responsable del tratamiento y Nutrionyx actúa
          como encargado del tratamiento (art. 28 RGPD), conforme al acuerdo
          de tratamiento de datos que cada profesional acepta dentro del
          producto. Sobre los datos de cuenta de los profesionales, Nutrionyx
          es responsable del tratamiento.
        </p>

        <H2>2. Datos que se tratan</H2>
        <ul>
          <li>
            Cuenta: nombre, correo electrónico y contraseña (almacenada de
            forma cifrada por el proveedor de identidad).
          </li>
          <li>
            Datos de salud del paciente (categoría especial, art. 9 RGPD):
            evaluación inicial, peso y medidas corporales, medicación,
            plan de dieta, entrenamiento, fotos de progreso, documentos y
            mensajes con su profesional.
          </li>
          <li>
            Registro técnico de eventos del sistema, inmutable, para
            trazabilidad y seguridad.
          </li>
        </ul>

        <H2>3. Finalidades y base jurídica</H2>
        <p>
          Los datos se tratan exclusivamente para prestar el servicio: la
          gestión de la ficha del paciente por su profesional (art. 6.1.b,
          ejecución de contrato). Los datos de salud se tratan en el marco de
          la relación asistencial entre profesional y paciente y con el
          consentimiento explícito del paciente (art. 9.2.a y 9.2.h RGPD).
          No hay publicidad, no hay analítica de terceros y los datos no se
          venden ni se ceden fuera de los subencargados listados.
        </p>

        <H2>4. Subencargados</H2>
        <ul>
          <li>Vercel: alojamiento de la aplicación y almacenamiento de archivos.</li>
          <li>Neon: base de datos, alojada en la región europea (eu-central-1).</li>
          <li>Resend: envío de correo transaccional (invitaciones y recordatorios sin contenido clínico).</li>
        </ul>
        <p>
          Algunos proveedores son empresas estadounidenses; las
          transferencias internacionales se amparan en cláusulas
          contractuales tipo o en el EU-US Data Privacy Framework.
        </p>

        <H2>5. Conservación</H2>
        <p>
          Los datos se conservan mientras la cuenta o la ficha del paciente
          estén activas. La supresión de un paciente elimina sus datos
          clínicos y anonimiza la ficha de forma irreversible.
        </p>

        <H2>6. Tus derechos</H2>
        <p>
          Acceso, rectificación, supresión, portabilidad, limitación y
          oposición. La exportación de datos (JSON) y la supresión están
          integradas en el producto. Puedes reclamar ante la Agencia
          Española de Protección de Datos (aepd.es).
        </p>

        <H2>7. Seguridad</H2>
        <p>
          Aislamiento de datos por consulta verificado en cada despliegue,
          registro de eventos inmutable, almacenamiento privado con acceso
          autenticado para fotos y documentos, y cifrado en tránsito. Los
          correos del sistema nunca incluyen datos clínicos.
        </p>

        <H2>8. Cookies</H2>
        <p>
          Solo cookies esenciales de sesión para la autenticación. La
          preferencia de tema se guarda en el almacenamiento local del
          navegador. No hay cookies de analítica ni de publicidad.
        </p>

        <H2>9. Menores</H2>
        <p>
          El servicio se dirige a profesionales. El alta de pacientes menores
          de edad requiere el consentimiento de sus tutores y es
          responsabilidad del profesional que los atiende.
        </p>

        <H2>10. Cambios</H2>
        <p>
          Esta es una versión provisional previa al lanzamiento comercial; la
          identificación fiscal completa del responsable se publicará antes
          del inicio de la actividad comercial. Los cambios sustanciales se
          anunciarán en esta página con su fecha de versión.
        </p>

        <p className="mt-10">
          <Link href="/" className="font-medium text-ink">
            Volver al inicio
          </Link>
          {" · "}
          <Link href="/terminos" className="font-medium text-ink">
            Términos del servicio
          </Link>
        </p>
      </article>
    </main>
  );
}
