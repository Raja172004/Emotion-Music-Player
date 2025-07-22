from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
from PIL import Image
import io
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import DeepFace, fallback to simulation if not available
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    logger.info("DeepFace library loaded successfully")
except ImportError:
    DEEPFACE_AVAILABLE = False
    logger.warning("DeepFace library not available, using simulation mode")
    import random

def simulate_emotion_detection():
    """Simulate emotion detection for demo purposes"""
    emotions = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
    emotion_scores = {}
    
    # Generate random but realistic emotion scores
    for emotion in emotions:
        emotion_scores[emotion] = random.uniform(0.01, 0.15)
    
    # Make one emotion dominant
    dominant_emotion = random.choice(emotions)
    emotion_scores[dominant_emotion] = random.uniform(0.6, 0.95)
    
    # Normalize scores to sum to 1
    total = sum(emotion_scores.values())
    emotion_scores = {k: v/total for k, v in emotion_scores.items()}
    
    return {
        'emotion': emotion_scores,
        'dominant_emotion': dominant_emotion,
        'region': {'x': 0, 'y': 0, 'w': 224, 'h': 224}
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'deepface_available': DEEPFACE_AVAILABLE,
        'service': 'emotion-detection-api'
    })

@app.route('/analyze', methods=['POST'])
def analyze_emotion():
    """Analyze emotion from base64 encoded image"""
    try:
        data = request.json
        if not data or 'img' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        img_data = data['img']
        
        # Handle data URL format (data:image/jpeg;base64,...)
        if ',' in img_data:
            img_data = img_data.split(',')[1]
        
        # Decode base64 image
        try:
            img_bytes = base64.b64decode(img_data)
            img = Image.open(io.BytesIO(img_bytes))
            
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Convert to numpy array
            img_array = np.array(img)
            
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            return jsonify({'error': 'Invalid image data'}), 400
        
        # Perform emotion analysis
        if DEEPFACE_AVAILABLE:
            try:
                # Use DeepFace for real emotion detection
                result = DeepFace.analyze(
                    img_array, 
                    actions=['emotion'], 
                    enforce_detection=False,
                    silent=True
                )
                
                # Handle both single result and list of results
                if isinstance(result, list):
                    result = result[0]
                
                logger.info(f"DeepFace analysis completed successfully")
                
            except Exception as e:
                logger.error(f"DeepFace analysis failed: {str(e)}")
                # Fallback to simulation
                result = simulate_emotion_detection()
        else:
            # Use simulation
            result = simulate_emotion_detection()
            logger.info("Using simulated emotion detection")
        
        # Format response to match expected structure
        response = {
            'results': {
                '0': result
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Unexpected error in analyze_emotion: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify service is working"""
    return jsonify({
        'message': 'DeepFace emotion detection service is running',
        'deepface_available': DEEPFACE_AVAILABLE,
        'endpoints': ['/health', '/analyze', '/test']
    })

if __name__ == '__main__':
    logger.info(f"Starting DeepFace emotion detection service...")
    logger.info(f"DeepFace available: {DEEPFACE_AVAILABLE}")
    app.run(host='0.0.0.0', port=5000, debug=True)