from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# Configure Gemini API using your provided key
genai.configure(api_key='AIzaSyAGIgskBR68Tf00Zs45uksYDU5Fbg6koUg')
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(os.path.join(app.static_folder, 'js'), filename)

@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory(os.path.join(app.static_folder, 'css'), filename)

@app.route('/test_openai', methods=['GET'])
def test_ai():
    try:
        response = model.generate_content("Say hello!")
        return jsonify({
            "status": "success",
            "message": response.text,
            "ai_provider": "Google Gemini 1.5 Flash"
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/evaluate_game1', methods=['POST'])
def eval_g1():
    try:
        print("=== GAME 1 EVALUATION CALLED ===")
        json_data = request.get_json()
        print(f"Received JSON: {json_data}")

        data = json_data.get("data", [])
        responses_text = "\n".join([f"Prompt: {r['prompt']} -> Response: {r.get('resp', 'SILENT')}" for r in data])

        prompt = (
            f"You are an AI coach for public speaking. "
            f"Analyze these rapid-fire analogy responses for creativity, confidence, and flow. "
            f"Keep your response to 2-3 sentences.\n"
            f"Analyze these responses:\n{responses_text}"
        )

        print("Calling Gemini API...")
        try:
            response = model.generate_content(prompt)
            ai_insight = response.text
        except Exception as e:
            print(f"AI API Error: {e}")
            ai_insight = "Keep practicing! Focus on quick, confident responses."

        spokes = sum(1 for r in data if r.get('spoke', False))
        avg_time = sum(r.get('time', 0) for r in data if r.get('spoke', False)) / max(spokes, 1) if data else 0

        result = {
            "response_rate": f"{spokes}/{len(data)}",
            "percentage": round((spokes/len(data))*100, 1) if data else 0,
            "average_time": round(avg_time, 1) if data else 0,
            "ai_feedback": ai_insight,
            "confidence_score": min(100, (spokes/len(data))*100 + (3-avg_time)*10) if data else 0,
            "missed_prompts": [r["prompt"] for r in data if not r.get("spoke", False)]
        }
        print(f"Returning result: {result}")
        return jsonify(result)
    except Exception as e:
        print(f"CRITICAL ERROR in eval_g1: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/evaluate_game2', methods=['POST'])
def eval_g2():
    try:
        print("=== GAME 2 EVALUATION CALLED ===")
        json_data = request.get_json()
        print(f"Received JSON: {json_data}")
        data = json_data.get("data", {})
        transitions = data.get('transitions', [])
        transcripts = data.get('transcripts', [])
        speech_text = "\n".join(transcripts) if transcripts else "No speech recognized."

        energy_now = [t.get('value', 5) for t in transitions] if transitions else [5]
        energy_msg = f"Energy transitions: {len(transitions)} changes with range {max(energy_now) - min(energy_now)}"
        prompt = (
            f"You are a public speaking coach. Analyze this continuous speech for energy, vocal variety, and engagement.\n"
            f"Speech transcript:\n{speech_text}\n"
            f"Performance: {energy_msg}\n"
            f"Give feedback on vocal energy and the delivery style, referencing what was actually said."
        )

        print("Gemini Prompt:", prompt)
        try:
            response = model.generate_content(prompt)
            ai_insight = response.text
        except Exception as e:
            print(f"AI Error Game 2: {e}")
            ai_insight = "Great energy modulation practice! Keep working on smooth transitions."

        energy_range = max(energy_now) - min(energy_now) if transitions else 0

        result = {
            "transitions_made": len(transitions),
            "energy_range": energy_range,
            "adaptability_score": min(100, len(transitions) * 15 + energy_range * 8),
            "ai_feedback": ai_insight
        }
        print(f"Returning result: {result}")
        return jsonify(result)
    except Exception as e:
        print(f"ERROR in eval_g2: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/evaluate_game3', methods=['POST'])
def eval_g3():
    try:
        print("=== GAME 3 EVALUATION CALLED ===")
        json_data = request.get_json()
        print(f"Received JSON: {json_data}")
        data = json_data.get("data", {})
        selected_words = data.get('selectedWords', [])
        transcripts = data.get('transcripts', [])
        woven = data.get('woven', [])

        speech_text = "\n".join(transcripts) if transcripts else "No speech recognized."
        woven_str = ', '.join(woven)
        prompt = (
            f"You are a communication coach. The player was challenged to weave these words: {', '.join(selected_words)}.\n"
            f"Speech transcript:\n{speech_text}\n"
            f"Words successfully woven in: {woven_str}\n"
            f"Give feedback on how smoothly and coherently these words were integrated, referencing the actual speech."
        )

        print("Gemini Prompt:", prompt)
        try:
            response = model.generate_content(prompt)
            ai_insight = response.text
        except Exception as e:
            print(f"AI Error Game 3: {e}")
            ai_insight = "Good integration practice! Focus on smoother word weaving."

        result = {
            "integrated_count": len(woven),
            "total_words": len(selected_words),
            "coherence_score": min(100, len(woven)/max(len(selected_words),1)*100),
            "ai_feedback": ai_insight,
            "missed_words": [w for w in selected_words if w not in woven]
        }
        print(f"Returning result: {result}")
        return jsonify(result)
    except Exception as e:
        print(f"ERROR in eval_g3: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🚀 AI Public Speaking Platform starting...")
    print("✅ Google Gemini 1.5 Flash integration ready")
    print("🔍 Debug mode enabled - check console for logs")
    app.run(debug=True)
