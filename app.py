import os
import io
import zipfile
from flask import Flask, request, send_file, render_template_string, redirect
from PIL import Image

app = Flask(__name__)

# Extensions autorisées
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Template HTML minimal pour le formulaire d'upload
INDEX_HTML = """
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>Convertisseur d'images en WebP</title>
  </head>
  <body>
    <h1>Convertisseur d'images en WebP</h1>
    <form method="post" enctype="multipart/form-data">
      <input type="file" name="files" multiple>
      <br><br>
      <input type="submit" value="Convertir">
    </form>
  </body>
</html>
"""

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Vérifie qu'il y a des fichiers dans la requête
        if 'files' not in request.files:
            return redirect(request.url)
        files = request.files.getlist('files')
        if not files:
            return redirect(request.url)
        
        # Préparation d'une archive ZIP en mémoire
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w') as zipf:
            for file in files:
                if file and allowed_file(file.filename):
                    # Récupère le nom du fichier de manière sécurisée
                    filename = os.path.basename(file.filename)
                    try:
                        # Ouvre l'image avec Pillow
                        image = Image.open(file)
                        img_io = io.BytesIO()
                        # Convertit et sauvegarde l'image au format WebP
                        image.save(img_io, format='WEBP')
                        img_io.seek(0)
                        # Renomme le fichier en remplaçant l'extension
                        name_without_ext = os.path.splitext(filename)[0]
                        new_filename = name_without_ext + '.webp'
                        # Ajoute le fichier converti à l'archive ZIP
                        zipf.writestr(new_filename, img_io.read())
                    except Exception as e:
                        print(f"Erreur lors de la conversion de {filename}: {e}")

        zip_buffer.seek(0)
        # Renvoie le fichier ZIP en téléchargement
        return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name='converted_images.zip')
    return render_template_string(INDEX_HTML)

if __name__ == '__main__':
    app.run(debug=True)
