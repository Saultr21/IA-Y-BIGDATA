from flask import Flask, render_template, jsonify, request, send_from_directory
import subprocess, asyncio, os, tempfile

app = Flask(__name__, template_folder='.')

# --------------------------------------------------------------------
#  RUTA DE DESCARGA 
# --------------------------------------------------------------------
@app.route('/save_xmi', methods=['POST'])
def save_xmi():
    try:
        data     = request.get_json()
        xmi      = data.get('xmi')                     
        filename = data.get('filename', 'diagram.xmi') 

        # Guarda (modo 'w' → sobrescribe si ya existe)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(xmi)

        return jsonify({'message': f'XMI guardado como {filename}'}), 200
    except Exception as e:
        return jsonify({'error': f'Error al guardar el XMI: {e}'}), 500


# --------------------------------------------------------------------
#  INICIO
# --------------------------------------------------------------------
@app.route('/')
def index():
    return render_template('index.html')

# --------------------------------------------------------------------
#  XMI  ➜  CLIPS  
# --------------------------------------------------------------------
@app.route('/to_clips', methods=['POST'])
def to_clips():
    try:
        xmi_text  = request.json.get('xmi')            
        clp_path  = request.json.get('clips', 'output.clp')

        xmi_path = 'diagram.xmi'
        with open(xmi_path, 'w', encoding='utf-8') as f:
            f.write(xmi_text)

        subprocess.run(['python', 'TraductorCLIPS.py', xmi_path, clp_path],
                       check=True)

        return jsonify({'message': f'XMI actualizado y CLIPS guardado como {clp_path}'}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({'error': f'Error TraductorCLIPS: {e}'}), 500
    except Exception as e:
        return jsonify({'error': f'Error inesperado: {e}'}), 500

# --------------------------------------------------------------------
#  CLIPS  ➜  JAVA
# --------------------------------------------------------------------
@app.route('/to_java', methods=['POST'])
def to_java():
    try:
        clp_path = request.json.get('clips', 'output.clp')

        process = subprocess.run(
            ['python', 'TraductorJava.py', clp_path],
            capture_output=True, text=True, check=False 
        )

        # Verificar si hubo un error (código de salida no es 0)
        if process.returncode != 0:
            # Devolver el error de stderr
            error_message = f"Error TraductorJava (stderr): {process.stderr.strip()}"
            app.logger.error(f"Error ejecutando TraductorJava.py: {process.stderr.strip()}") # Log para el servidor
            return jsonify({'error': error_message}), 500

        java_code = process.stdout
        java_path = 'output.java'
        with open(java_path, 'w', encoding='utf-8') as f:
            f.write(java_code)

        return jsonify({
            'message': f'Java guardado como {java_path}',
            'java_code': java_code
        }), 200
    except Exception as e:
        app.logger.error(f"Error inesperado en /to_java: {e}") # Log para el servidor
        return jsonify({'error': f'Error inesperado en /to_java: {e}'}), 500

@app.route('/to_python', methods=['POST'])
def to_python():
    try:
        java_code = request.get_json().get('java_code')

        if not java_code:
            return jsonify({'error': 'No se proporcionó código Java para traducir'}), 400

        from TraductorPython import translate_java_to_python
        python_code = asyncio.run(translate_java_to_python(java_code))
        python_path = 'output.py'
        with open(python_path, 'w', encoding='utf-8') as f:
            f.write(python_code)
        return jsonify({'python_code': python_code,
                        'message': f'Python guardado en {python_path}'})
    except Exception as e:
        return jsonify({'error': f'Error inesperado: {e}'}), 500

# --------------------------------------------------------------------
#  DESCARGA JAVA
# --------------------------------------------------------------------
@app.route('/download_java')
def download_java():
    try:
        # Envía el archivo 'output.java' desde el directorio actual como adjunto
        return send_from_directory('.', 'output.java', as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'Archivo Java no encontrado en el servidor.'}), 404
    except Exception as e:
        return jsonify({'error': f'Error al descargar Java: {e}'}), 500

# --------------------------------------------------------------------
#  DESCARGA PYTHON
# --------------------------------------------------------------------
@app.route('/download_python')
def download_python():
    try:
        # Envía el archivo 'output.py' desde el directorio actual como adjunto
        return send_from_directory('.', 'output.py', as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'Archivo Python no encontrado en el servidor.'}), 404
    except Exception as e:
        return jsonify({'error': f'Error al descargar Python: {e}'}), 500

@app.route('/download_xmi')
def download_xmi():
    try:
        # Envía el archivo 'diagram.xmi' desde el directorio actual como adjunto
        return send_from_directory('.', 'diagram.xmi', as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'Archivo XMI no encontrado en el servidor.'}), 404
    except Exception as e:
        return jsonify({'error': f'Error al descargar XMI: {e}'}), 500

if __name__ == '__main__':
    app.run(debug=True)