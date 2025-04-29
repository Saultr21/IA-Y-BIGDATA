class Clase2:
   def __init__(self):
      self.Numero=None
      self.Direccion=None
   def getNumero(self):
      return self.Numero
   def setNumero(self,Numero):
      self.Numero = Numero
   def getDireccion(self):
      return self.Direccion
   def setDireccion(self,Direccion):
      self.Direccion = Direccion

class Clase1:
   def __init__(self):
      self.Nombre=None
      self.clase2List1=set()
   def getNombre(self):
      return self.Nombre
   def setNombre(self,Nombre):
      self.Nombre = Nombre
   def getClase2List1(self):
      return self.clase2List1
   def setClase2List1(self,clase2List1):
      self.clase2List1 = clase2List1
   def Añadir(self):
      pass