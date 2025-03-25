import os
import glob
from flask import Flask, render_template, request
import torch
from torchvision import transforms, models
from PIL import Image
import torch.nn as nn
from torchvision.models import EfficientNet_B3_Weights
import torch.nn.functional as F

app = Flask(__name__)

# Asegurar que la carpeta para fotos existe
UPLOAD_FOLDER = 'static/foto'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Definición del modelo (debe ser la misma que usaste para entrenar)
class LungCancerModel(nn.Module):
    def __init__(self, num_classes):
        super(LungCancerModel, self).__init__()
        self.efficientnet = models.efficientnet_b3(weights=None) # Important: weights=None
        for param in list(self.efficientnet.parameters())[:-30]:
            param.requires_grad = False
        in_features = self.efficientnet.classifier[1].in_features
        self.efficientnet.classifier = nn.Sequential(
            nn.Dropout(p=0.3, inplace=True),
            nn.Linear(in_features, num_classes)
        )

    def forward(self, x):
        return self.efficientnet(x)

# Cargar el modelo reentrenado
num_classes = 6  # Ahora tenemos 6 clases
modelo = LungCancerModel(num_classes=num_classes)
modelo.load_state_dict(torch.load('lung_cancer_model_todos.pth', map_location=torch.device('cpu'))) #cargar el nuevo modelo
modelo.eval()

# Transformaciones para las imágenes
transformaciones = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Diccionario de clases actualizado
clases = {
    0: 'Adenocarcinoma de Colon',
    1: 'Colon Benigno',
    2: 'Carcinoma escamoso pulmonar',
    3: 'Adenocarcinoma pulmonar',
    4: 'Tejido pulmonar benigno',
    5: 'Otros'
}


def limpiar_carpeta_fotos():
    """Elimina todas las imágenes en la carpeta de fotos"""
    archivos = glob.glob(os.path.join(UPLOAD_FOLDER, '*'))
    for archivo in archivos:
        try:
            if os.path.isfile(archivo):
                os.remove(archivo)
                print(f"Archivo eliminado: {archivo}")
        except Exception as e:
            print(f"Error al eliminar {archivo}: {e}")

def predecir(imagen_path):
    imagen = Image.open(imagen_path).convert('RGB')
    imagen_tensor = transformaciones(imagen).unsqueeze(0)
    with torch.no_grad():
        salida = modelo(imagen_tensor)
        probabilidades = F.softmax(salida, dim=1)[0] * 100
        
        # Imprimir probabilidades detalladas para depuración
        print("\nProbabilidades por clase:")
        for i, prob in enumerate(probabilidades):
            clase_nombre = clases.get(i, f"Índice {i} desconocido")
            print(f"  Clase {i} ({clase_nombre}): {prob.item():.2f}%")
        
        confianza, prediccion = torch.max(probabilidades, 0)
        print(f"Salida del modelo: {salida}")
        print(f"Probabilidades: {probabilidades}")
        print(f"Predicción (índice): {prediccion.item()}")
    return prediccion.item(), confianza.item(), probabilidades.tolist()

@app.route('/', methods=['GET', 'POST'])
def index():
    prediccion_texto = None
    confianza = None
    confianzas = None
    imagen_path = None
    
    if request.method == 'POST':
        if 'imagen' not in request.files:
            return 'No se ha subido ninguna imagen.'
        
        imagen = request.files['imagen']
        if imagen.filename == '':
            return 'No se ha seleccionado ninguna imagen.'
        
        if imagen:
            # Limpiar la carpeta antes de guardar la nueva imagen
            limpiar_carpeta_fotos()
            
            # Guardar la nueva imagen
            imagen_path = os.path.join(UPLOAD_FOLDER, imagen.filename)
            imagen.save(imagen_path)
            
            prediccion, confianza, confianzas = predecir(imagen_path)
            
            # Manejar el caso donde la predicción no está en el diccionario
            try:
                prediccion_texto = clases.get(prediccion, "Desconocido")
            except Exception as e:
                print(f"Error al obtener la clase: {e}")
                prediccion_texto = "Desconocido"
            
    return render_template('index_todo.j2', prediccion=prediccion_texto, 
                           confianza=confianza, confianzas=confianzas, 
                           imagen_path=imagen_path)

if __name__ == '__main__':
    app.run(debug=True)