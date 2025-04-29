
// Java code for class Clase2
public class Clase2 {
   public int Numero;
   public int getNumero() {
      return this.Numero;
   }
   public void setNumero(int Numero) {
      this.Numero = Numero;
   }
   public String Direccion;
   public String getDireccion() {
      return this.Direccion;
   }
   public void setDireccion(String Direccion) {
      this.Direccion = Direccion;
   }
}

// Java code for class Clase1
public class Clase1 {
   public String Nombre;
   public String getNombre() {
      return this.Nombre;
   }
   public void setNombre(String Nombre) {
      this.Nombre = Nombre;
   }
   private HashSet<Clase2> clase2List1;
   public HashSet<Clase2> getClase2List1() {
      return this.clase2List1;
   }
   public void setClase2List1(HashSet<Clase2> clase2List1) {
      this.clase2List1 = clase2List1;
   }
   public void Añadir() {
      // method body
   }
}

