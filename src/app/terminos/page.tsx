import Link from "next/link";

export const metadata = {
  title: "Términos del servicio",
  description:
    "Condiciones de uso de Nutrionyx: objeto del servicio, cuentas, responsabilidad profesional, uso aceptable y ley aplicable.",
  alternates: { canonical: "/terminos" },
};

/**
 * Legal document, not UI copy: the text lives here rather than in
 * messages/es.json. Provisional version; see the note in section 10.
 */

const UPDATED = "10 de agosto de 2026";

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 font-display text-xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

export default function TermsPage() {
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
          Términos del servicio
        </h1>
        <p className="text-sm text-ink-subtle">
          Versión provisional · actualizada el {UPDATED}
        </p>

        <H2>1. Objeto</H2>
        <p>
          Nutrionyx es una plataforma que reúne en una ficha única la
          información de cada paciente de una consulta de nutrición:
          evaluación, dieta, entrenamiento, medicación, medidas, fotos,
          documentos, mensajes y citas. El uso del servicio implica la
          aceptación de estos términos.
        </p>

        <H2>2. Cuentas</H2>
        <p>
          Los profesionales crean su consulta y acceden con su cuenta. Los
          pacientes acceden únicamente por invitación de su profesional. Cada
          persona es responsable de la custodia de sus credenciales y de la
          actividad realizada con su cuenta.
        </p>

        <H2>3. Uso profesional</H2>
        <p>
          Nutrionyx es una herramienta de gestión. No presta consejo médico
          ni nutricional y no sustituye el juicio clínico. Las decisiones
          clínicas, la prescripción de pautas y la exactitud de los datos
          introducidos son responsabilidad exclusiva del profesional.
        </p>

        <H2>4. Uso aceptable</H2>
        <ul>
          <li>No compartir credenciales ni sesiones.</li>
          <li>
            No introducir datos de terceros sin base legal para su
            tratamiento.
          </li>
          <li>
            No usar el servicio para fines ilícitos ni intentar acceder a
            datos de otras consultas.
          </li>
        </ul>

        <H2>5. Datos personales</H2>
        <p>
          El tratamiento de datos se rige por la{" "}
          <Link href="/privacidad" className="font-medium text-ink">
            política de privacidad
          </Link>{" "}
          y, para los datos clínicos de pacientes, por el acuerdo de
          tratamiento de datos que cada profesional acepta dentro del
          producto.
        </p>

        <H2>6. Disponibilidad</H2>
        <p>
          El servicio se encuentra en fase inicial y se presta sin acuerdo de
          nivel de servicio. Se procurará la continuidad del servicio y el
          aviso previo razonable de cambios relevantes o interrupciones
          programadas.
        </p>

        <H2>7. Propiedad intelectual</H2>
        <p>
          El software y la marca Nutrionyx pertenecen a su titular. Los datos
          introducidos pertenecen a la consulta y a sus pacientes; Nutrionyx
          no adquiere ningún derecho sobre ellos más allá de lo necesario
          para prestar el servicio.
        </p>

        <H2>8. Responsabilidad</H2>
        <p>
          En la medida permitida por la ley, Nutrionyx no responde de las
          decisiones clínicas adoptadas con apoyo de la herramienta ni de los
          daños indirectos derivados del uso del servicio.
        </p>

        <H2>9. Terminación</H2>
        <p>
          Puedes dejar de usar el servicio en cualquier momento y solicitar
          la supresión de tus datos. El incumplimiento grave de estos
          términos puede conllevar la suspensión de la cuenta, con aviso
          previo salvo urgencia justificada.
        </p>

        <H2>10. Ley aplicable y contacto</H2>
        <p>
          Estos términos se rigen por la legislación española. Versión
          provisional previa al lanzamiento comercial; la identificación
          fiscal completa del titular se publicará antes del inicio de la
          actividad comercial. Contacto: lexsantor@gmail.com.
        </p>

        <p className="mt-10">
          <Link href="/" className="font-medium text-ink">
            Volver al inicio
          </Link>
          {" · "}
          <Link href="/privacidad" className="font-medium text-ink">
            Política de privacidad
          </Link>
        </p>
      </article>
    </main>
  );
}
