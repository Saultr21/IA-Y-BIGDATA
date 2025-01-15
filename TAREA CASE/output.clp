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
  (attribute (id attr1) (class-name a) (name a) (visibility public) (type "int"))
  (attribute (id attr2) (class-name a) (name b) (visibility public) (type "float[]"))
  (attribute (id attr3) (class-name a) (name cList1) (visibility private) (type "HashSet<c>"))
  (attribute (id attr4) (class-name a) (name aList3) (visibility private) (type "HashSet<a>"))
  (operation (id op1) (class-name a) (name f) (visibility private) (type "void"))
  (class (name a) (attributes attr1 attr2 attr3 attr4) (operations op1))
  (attribute (id attr5) (class-name b) (name b1) (visibility private) (type "String"))
  (operation (id op2) (class-name b) (name g) (visibility protected) (type "boolean[]"))
  (operation (id op3) (class-name b) (name nc) (visibility private) (type "Integer"))
  (class (name b) (attributes attr5) (operations op2 op3))
  (attribute (id attr6) (class-name c) (name bList2) (visibility private) (type "HashSet<b>"))
  (operation (id op4) (class-name c) (name w) (visibility private) (type "ArrayList<Float>"))
  (class (name c) (attributes attr6) (operations op4))
  (attribute (id attr7) (class-name d) (name bb) (visibility public) (type "String"))
  (class (name d) (attributes attr7) (operations ))
  (attribute (id attr8) (class-name e) (name c) (visibility private) (type "String[]"))
  (attribute (id attr9) (class-name e) (name c2) (visibility private) (type "HashMap<Integer,e>"))
  (class (name e) (attributes attr8 attr9) (operations ))
  (generalization (parent a) (child b))
  (directedAssociation (source a) (target c) (multiplicity1 1) (multiplicity2 *))
  (directedAssociation (source c) (target b) (multiplicity1 1) (multiplicity2 *))
  (directedAssociation (source a) (target a) (multiplicity1 1) (multiplicity2 *))
  (association (source e) (target c) (multiplicity1 None) (multiplicity2 None))
  (dependency (client e) (supplier d))
  (composition (whole d) (part c) (multiplicity None))
  (aggregation (whole d) (part b) (multiplicity None))
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
   
   ;; Imprimir m todos
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
   
   ;; Imprimir m todos
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
