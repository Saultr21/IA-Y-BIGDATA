import sys
import aiohttp
import asyncio
from dotenv import load_dotenv
import os

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# URL de la API de OpenRouter
API_URL = "https://openrouter.ai/api/v1/chat/completions"
API_KEY = os.getenv("API_KEY")  # Cargar la clave de API desde el archivo .env

if not API_KEY:
    raise Exception("La clave de API no está configurada. Asegúrate de definir API_KEY en el archivo .env.")

async def translate_java_to_python(java_code):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "meta-llama/llama-4-maverick:free",
        "messages": [
            {
                "role": "system",
                "content": "Eres un traductor de código. Convierte el siguiente código Java a Python. Solo devuelve el codigo una vez, sin versiones anteriores ni comentarios. No devuelvas nada más que el código Python. No lo formatees. No lo devuelvas dentro de un boxed."
            },
            {
                "role": "user",
                "content": java_code
            }
        ],
        "max_tokens": 2048,
        "temperature": 0.2
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(API_URL, headers=headers, json=payload) as response:
            if response.status == 200:
                result = await response.json()
                return result["choices"][0]["message"]["content"]
            else:
                error_message = await response.text()
                raise Exception(f"Error en la API: {response.status} - {error_message}")

async def main(input_file, output_file):
    try:
        # Leer el código Java del archivo de entrada
        with open(input_file, "r") as file:
            java_code = file.read()

        # Traducir el código Java a Python
        python_code = await translate_java_to_python(java_code)

        # Limpieza más robusta de la salida
        python_code = python_code.replace("```python", "")
        python_code = python_code.replace("```", "")
        python_code = python_code.replace("\\boxed{", "") 
        python_code = python_code.replace("}", "") 
        python_code = python_code.strip() 

        # Guardar el código Python en el archivo de salida
        with open(output_file, "w") as file:
            file.write(python_code)

        print(f"Traducción completada. Código Python guardado en {output_file}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Falta el codigo java")
    else:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
        asyncio.run(main(input_file, output_file))