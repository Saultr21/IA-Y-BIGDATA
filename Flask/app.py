from flask import Flask
from flask import send_file
from flask import Flask, request, send_file, render_template
from flask_cors import CORS
import os
from Traductor import parse_xmi, extract_classes, extract_generalizations, extract_directed_associations, extract_associations, extract_dependencies, extract_compositions, extract_aggregations, generate_clips_facts, write_clips_file, process_clips


app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas las rutas

@app.route('/')
def index():
    return render_template('UML.html')  # Cambia la ruta del template

@app.route('/translate', methods=['POST'])
def translate():
    file = request.files['file']
    file_path = os.path.join('uploads', file.filename)
    file.save(file_path)

    root = parse_xmi(file_path)
    classes, class_dict = extract_classes(root)
    generalizations = extract_generalizations(root)
    directed_associations = extract_directed_associations(root, class_dict)
    associations = extract_associations(root)
    dependencies = extract_dependencies(root)
    compositions = extract_compositions(root)
    aggregations = extract_aggregations(root)

    relationships = generalizations + directed_associations + associations + dependencies + compositions + aggregations

    clips_facts = generate_clips_facts(classes, relationships)
    clips_file_path = os.path.join('uploads', 'output.clp')
    write_clips_file(clips_facts, clips_file_path)

    return send_file(clips_file_path, as_attachment=True)

@app.route('/generate-code', methods=['POST'])
def generate_code():
    file = request.files['file']
    file_path = os.path.join('uploads', file.filename)
    file.save(file_path)

    java_file_path = process_clips(file_path)
    return send_file(java_file_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Asegúrate de que el puerto sea 5000
