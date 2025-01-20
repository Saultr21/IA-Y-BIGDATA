(deftemplate class
   (slot name)
   (multislot attributes)
   (multislot operations))
(deftemplate attribute
   (slot id)
   (slot class-name)
   (slot name)
   (slot visibility)
   (slot type))
(deftemplate operation
   (slot id)
   (slot class-name)
   (slot name)
   (slot visibility)
   (slot type))
(deftemplate dependency
   (slot client)
   (slot supplier))
(deftemplate generalization
   (slot parent)
   (slot child))
(deftemplate directedAssociation
   (slot source)
   (slot target)
   (slot multiplicity1)
  (slot multiplicity2))
(deftemplate association
   (slot source)
   (slot target)
   (slot multiplicity1)
  (slot multiplicity2))
(deftemplate composition
   (slot whole)
   (slot part)
   (slot multiplicity))
(deftemplate aggregation
   (slot whole)
   (slot part)
   (slot multiplicity))
(deffacts initial-facts
  (attribute (id attr1) (class-name A) (name a) (visibility private) (type "String[][]"))
  (operation (id op1) (class-name A) (name zc) (visibility public) (type "boolean"))
  (operation (id op2) (class-name A) (name s) (visibility public) (type "HasMap<Integer,C>"))
  (operation (id op3) (class-name A) (name s) (visibility public) (type "HashMap<Integer,C>"))
  (class (name A) (attributes attr1) (operations op1 op2 op3))
  (attribute (id attr2) (class-name B) (name bList1) (visibility private) (type "HashSet<B>"))
  (operation (id op4) (class-name B) (name bv) (visibility protected) (type "void"))
  (operation (id op5) (class-name B) (name ff) (visibility protected) (type "int"))
  (class (name B) (attributes attr2) (operations op4 op5))
  (attribute (id attr3) (class-name C) (name k) (visibility public) (type "int"))
  (attribute (id attr4) (class-name C) (name bList2) (visibility private) (type "B[]"))
  (class (name C) (attributes attr3 attr4) (operations ))
  (attribute (id attr5) (class-name D) (name d) (visibility private) (type "Float[]"))
  (operation (id op6) (class-name D) (name f) (visibility protected) (type "ArrayList<Integer>"))
  (operation (id op7) (class-name D) (name g) (visibility protected) (type "void"))
  (class (name D) (attributes attr5) (operations op6 op7))
  (attribute (id attr6) (class-name E) (name e) (visibility public) (type "int"))
  (attribute (id attr7) (class-name E) (name w) (visibility private) (type "LinkedList<String>"))
  (class (name E) (attributes attr6 attr7) (operations ))
  (attribute (id attr8) (class-name F) (name rr) (visibility public) (type "LinkedList<Integer>"))
  (attribute (id attr9) (class-name F) (name s) (visibility public) (type "int[]"))
  (operation (id op8) (class-name F) (name tt) (visibility protected) (type "int[]"))
  (operation (id op9) (class-name F) (name w) (visibility protected) (type "void"))
  (class (name F) (attributes attr8 attr9) (operations op8 op9))
  (attribute (id attr10) (class-name G) (name g) (visibility public) (type "int"))
  (attribute (id attr11) (class-name G) (name p) (visibility private) (type "float"))
  (attribute (id attr12) (class-name G) (name q) (visibility protected) (type "String"))
  (attribute (id attr13) (class-name G) (name dList3) (visibility private) (type "HashSet<D>"))
  (attribute (id attr14) (class-name G) (name aList4) (visibility private) (type "A[]"))
  (attribute (id attr15) (class-name G) (name gList5) (visibility private) (type "HashSet<G>"))
  (operation (id op10) (class-name G) (name z) (visibility private) (type "int[][]"))
  (class (name G) (attributes attr10 attr11 attr12 attr13 attr14 attr15) (operations op10))
  (generalization (parent A) (child D))
  (generalization (parent G) (child C))
  (directedAssociation (source B) (target B) (multiplicity1 1) (multiplicity2 *))
  (directedAssociation (source C) (target B) (multiplicity1 1) (multiplicity2 22))
  (directedAssociation (source G) (target D) (multiplicity1 1) (multiplicity2 *))
  (directedAssociation (source G) (target A) (multiplicity1 1) (multiplicity2 44))
  (directedAssociation (source G) (target G) (multiplicity1 1) (multiplicity2 *))
  (association (source F) (target B) (multiplicity1 None) (multiplicity2 None))
  (dependency (client A) (supplier C))
  (composition (whole D) (part B) (multiplicity None))
  (aggregation (whole D) (part E) (multiplicity None))
)

(defrule generate-java-code
   
   ?class <- (class (name ?class-name) (attributes $?attributes) (operations $?operations))
   (generalization (parent ?class-name) (child ?x))
   =>
   (printout t "// Java code for class " ?class-name crlf)
   (printout t "public class " ?class-name " extends " ?x " {" crlf)
   
   ;; Imprimir atributos
   (do-for-all-facts ((?attr attribute))
      (and
         (member$ (fact-slot-value ?attr id) $?attributes)
         (eq (fact-slot-value ?attr class-name) ?class-name))
      (bind ?visibility (fact-slot-value ?attr visibility))
      (bind ?type (fact-slot-value ?attr type))
      (bind ?name (fact-slot-value ?attr name))
      (printout t  "   " ?visibility " " ?type " " ?name ";" crlf))
   
   ;; Imprimir m�todos
   (do-for-all-facts ((?op operation))
      (and
         (member$ (fact-slot-value ?op id) $?operations)
         (eq (fact-slot-value ?op class-name) ?class-name))
      (bind ?visibility (fact-slot-value ?op visibility))
      (bind ?type (fact-slot-value ?op type))
      (bind ?name (fact-slot-value ?op name))
      (printout t "   " ?visibility " " ?type " " ?name "()" " {" crlf
                "      // method body" crlf "   }" crlf))
   
   (printout t "}" crlf crlf)
)
                   
(defrule generate-java-code-no-inheritance
   ?class <- (class (name ?class-name) (attributes $?attributes) (operations $?operations))
   (not (generalization (parent ?class-name)))
    =>
   (printout t "// Java code for class " ?class-name crlf)
   (printout t "public class " ?class-name " {" crlf)
   
   ;; Imprimir atributos
   (do-for-all-facts ((?attr attribute))
      (and
         (member$ (fact-slot-value ?attr id) $?attributes)
         (eq (fact-slot-value ?attr class-name) ?class-name))
      (bind ?visibility (fact-slot-value ?attr visibility))
      (bind ?type (fact-slot-value ?attr type))
      (bind ?name (fact-slot-value ?attr name))
      (printout t  "   " ?visibility " " ?type " " ?name ";" crlf))
   
   ;; Imprimir m�todos
   (do-for-all-facts ((?op operation))
      (and
         (member$ (fact-slot-value ?op id) $?operations)
         (eq (fact-slot-value ?op class-name) ?class-name))
      (bind ?visibility (fact-slot-value ?op visibility))
      (bind ?type (fact-slot-value ?op type))
      (bind ?name (fact-slot-value ?op name))
      (printout t "   " ?visibility " " ?type " " ?name "()" " {" crlf
                "      // method body" crlf "   }" crlf))
   
   (printout t "}" crlf crlf)
)
