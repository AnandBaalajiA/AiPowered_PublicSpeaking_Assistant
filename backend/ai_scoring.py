def eval_game1(responses):
    score = sum(1 for r in responses if r['spoke']) / len(responses)
    avg_time = (
        sum([r['time'] for r in responses if r['spoke']]) /
        max(1, sum(1 for r in responses if r['spoke']))
    )
    feedback = "Great speed!" if avg_time <= 3 else "Try to be faster."
    return {"response_rate": score, "avg_time": avg_time, "feedback": feedback}

def eval_game2(payload):
    transitions = payload['transitions']
    speed = len(transitions) / max(1, sum([abs(t['now']-t['prev']) for t in transitions]))
    feedback = "Smooth transitions!" if speed > 1 else "Practice energy shifts."
    return {"transitions": len(transitions), "smoothness": speed, "feedback": feedback}

def eval_game3(integrated):
    integration_rate = sum(1 for w in integrated if w['spoken']) / len(integrated)
    coherence = "Kept topic well." if integration_rate >= 0.7 else "Work on coherence."
    feedback = "Try integrating words more smoothly."
    return {"integration": integration_rate, "coherence": coherence, "feedback": feedback}
