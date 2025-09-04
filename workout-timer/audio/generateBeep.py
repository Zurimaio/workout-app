from pydub import AudioSegment
from pydub.generators import Sine

# Genera un beep di 1 secondo a 1000 Hz
beep = Sine(250).to_audio_segment(duration=244)  
beep.export("beep.wav", format="wav")
print("beep.wav generato!")
