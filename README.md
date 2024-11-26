<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enregistrement vidéo</title>
</head>
<body>
    <h1>Enregistrement vidéo</h1>
    <video id="preview" autoplay muted style="width: 100%; max-width: 600px; border: 1px solid black;"></video>
    <div>
        <button id="start-btn">Démarrer l'enregistrement</button>
        <button id="stop-btn" disabled>Arrêter l'enregistrement</button>
    </div>
    <p id="status">Appuyez sur "Démarrer l'enregistrement" pour commencer.</p>
    <video id="playback" controls style="display: none; width: 100%; max-width: 600px; border: 1px solid black;"></video>
    <a id="download-link" style="display: none;">Télécharger l'enregistrement</a>

    <script>
        let mediaRecorder;
        let recordedChunks = [];
        const preview = document.getElementById('preview');
        const playback = document.getElementById('playback');
        const startBtn = document.getElementById('start-btn');
        const stopBtn = document.getElementById('stop-btn');
        const statusText = document.getElementById('status');
        const downloadLink = document.getElementById('download-link');

        // Demander l'accès à la webcam et configurer le flux vidéo
        async function setupCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                preview.srcObject = stream;
                return stream;
            } catch (error) {
                statusText.textContent = 'Erreur : Impossible d\'accéder à la webcam.';
                console.error('Erreur d\'accès à la webcam :', error);
            }
        }

        // Fonction pour démarrer l'enregistrement
        startBtn.addEventListener('click', async () => {
            const stream = await setupCamera();
            if (!stream) return;

            mediaRecorder = new MediaRecorder(stream);
            recordedChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
                const videoURL = URL.createObjectURL(videoBlob);

                // Préparer la lecture et le téléchargement de la vidéo
                playback.src = videoURL;
                playback.style.display = 'block';

                downloadLink.href = videoURL;
                downloadLink.download = 'enregistrement-video.webm';
                downloadLink.textContent = 'Télécharger l\'enregistrement';
                downloadLink.style.display = 'block';

                // Arrêter le flux vidéo
                const tracks = stream.getTracks();
                tracks.forEach((track) => track.stop());
            };

            mediaRecorder.start();
            statusText.textContent = 'Enregistrement en cours...';
            startBtn.disabled = true;
            stopBtn.disabled = false;

            // Arrêter automatiquement après 2 minutes
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                    statusText.textContent = 'Enregistrement terminé.';
                    startBtn.disabled = false;
                    stopBtn.disabled = true;
                }
            }, 2 * 60 * 1000); // 2 minutes
        });

        // Fonction pour arrêter l'enregistrement manuellement
        stopBtn.addEventListener('click', () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                statusText.textContent = 'Enregistrement terminé.';
                startBtn.disabled = false;
                stopBtn.disabled = true;
            }
        });
    </script>
</body>
</html>
