const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null

export function playClick() {
  if (!audioContext) return
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  osc.type = 'sine'
  osc.frequency.value = 440
  gain.gain.value = 0.12
  osc.connect(gain)
  gain.connect(audioContext.destination)
  osc.start()
  osc.stop(audioContext.currentTime + 0.075)
}
