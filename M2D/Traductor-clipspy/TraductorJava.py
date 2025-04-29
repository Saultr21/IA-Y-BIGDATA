import sys
import clips
import io
import contextlib
import textwrap

# ----------------------------------------------------------------------
#  Reglas CLIPS que generan el código Java
# ----------------------------------------------------------------------
JAVA_RULES = textwrap.dedent("""\
    (defrule generate-java-code
       ?class <- (class (name ?class-name) (attributes $?attributes) (operations $?operations))
       (generalization (parent ?class-name) (child ?x))
       =>
       (printout t "// Java code for class " ?class-name crlf)
       (printout t "public class " ?class-name " extends " ?x " {" crlf)

       ;; atributos + getters / setters
       (do-for-all-facts ((?attr attribute))
          (and (member$ (fact-slot-value ?attr id) $?attributes)
               (eq (fact-slot-value ?attr class-name) ?class-name))
          (bind ?v (fact-slot-value ?attr visibility))
          (bind ?t (fact-slot-value ?attr type))
          (bind ?n (fact-slot-value ?attr name))
          (bind ?getter-name
                (str-cat
                   (upcase (sub-string 1 1 ?n))
                   (sub-string 2 (str-length ?n) ?n)))
          (printout t "   " ?v " " ?t " " ?n ";" crlf
                    "   public " ?t " get" ?getter-name "() {" crlf
                    "      return this." ?n ";" crlf
                    "   }" crlf
                    "   public void set" ?getter-name "(" ?t " " ?n ") {" crlf
                    "      this." ?n " = " ?n ";" crlf
                    "   }" crlf))

       ;; operaciones (ahora con tipo por defecto 'void' si ?t está vacío)
       (do-for-all-facts ((?op operation))
          (and (member$ (fact-slot-value ?op id) $?operations)
               (eq (fact-slot-value ?op class-name) ?class-name))
          (bind ?v (fact-slot-value ?op visibility))
          (bind ?t (fact-slot-value ?op type))
          ;; si ?t es cadena vacía, lo reemplazamos por 'void'
          (bind ?ret-type (if (neq ?t "") then ?t else "void"))
          (bind ?n (fact-slot-value ?op name))
          (printout t "   " ?v " " ?ret-type " " ?n "()" " {" crlf
                    "      // method body" crlf
                    "   }" crlf))

       (printout t "}" crlf crlf)
    )

    (defrule generate-java-code-no-inheritance
       ?class <- (class (name ?class-name) (attributes $?attributes) (operations $?operations))
       (not (generalization (parent ?class-name)))
       =>
       (printout t "// Java code for class " ?class-name crlf)
       (printout t "public class " ?class-name " {" crlf)

       ;; atributos + getters / setters
       (do-for-all-facts ((?attr attribute))
          (and (member$ (fact-slot-value ?attr id) $?attributes)
               (eq (fact-slot-value ?attr class-name) ?class-name))
          (bind ?v (fact-slot-value ?attr visibility))
          (bind ?t (fact-slot-value ?attr type))
          (bind ?n (fact-slot-value ?attr name))
          (bind ?getter-name
                (str-cat
                   (upcase (sub-string 1 1 ?n))
                   (sub-string 2 (str-length ?n) ?n)))
          (printout t "   " ?v " " ?t " " ?n ";" crlf
                    "   public " ?t " get" ?getter-name "() {" crlf
                    "      return this." ?n ";" crlf
                    "   }" crlf
                    "   public void set" ?getter-name "(" ?t " " ?n ") {" crlf
                    "      this." ?n " = " ?n ";" crlf
                    "   }" crlf))

       ;; operaciones sin herencia (igual default 'void')
       (do-for-all-facts ((?op operation))
          (and (member$ (fact-slot-value ?op id) $?operations)
               (eq (fact-slot-value ?op class-name) ?class-name))
          (bind ?v (fact-slot-value ?op visibility))
          (bind ?t (fact-slot-value ?op type))
          (bind ?ret-type (if (neq ?t "") then ?t else "void"))
          (bind ?n (fact-slot-value ?op name))
          (printout t "   " ?v " " ?ret-type " " ?n "()" " {" crlf
                    "      // method body" crlf
                    "   }" crlf))

       (printout t "}" crlf crlf)
    )
""")

# ----------------------------------------------------------------------
#  Funciones auxiliares
# ----------------------------------------------------------------------
def inject_rules(env):
    """Carga las reglas una a una en el entorno CLIPS."""
    construct = []
    for line in JAVA_RULES.splitlines():
        if line.lstrip().startswith("(defrule") and construct:
            env.build("\n".join(construct))
            construct = [line]
        else:
            construct.append(line)
    if construct:
        env.build("\n".join(construct))

def convert_clp_to_java(clp_path: str) -> str:
    """Ejecuta el .clp y captura la salida Java."""
    env = clips.Environment()
    env.load(clp_path)
    inject_rules(env)
    env.reset()
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        env.run()
    return buf.getvalue()

# ----------------------------------------------------------------------
#  Script CLI
# ----------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python TraductorJava.py <archivo.clp>", file=sys.stderr)
        sys.exit(1)

    try:
        java_code = convert_clp_to_java(sys.argv[1])
        print(java_code)
    except Exception as exc:
        print(f"Error TraductorJava: {exc}", file=sys.stderr)
        sys.exit(1)
