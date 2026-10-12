import type { Frame } from '@/lib/commentary/engine'

export type CrowdReaction = 'kickoff' | 'roar' | 'cheer' | 'gasp' | 'queenSac' | 'groan' | 'ooh' | 'fulltime'

interface BurstOptions {
  freq: number
  toFreq?: number
  q: number
  peak: number
  attack: number
  hold: number
  release: number
  delay?: number
}

const NOISE_SECONDS = 8

function createPinkNoise(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }
  }
  return buffer
}

/**
 * Stadium crowd synthesised with the Web Audio API: filtered pink-noise layers
 * for the ambient bed, and enveloped noise bursts / a referee whistle for reactions.
 */
export class CrowdEngine {
  private ctx: AudioContext
  private output: GainNode
  private noise: AudioBuffer
  private bed: { gain: GainNode; nodes: AudioScheduledSourceNode[] } | null = null

  constructor() {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new Ctor()
    const compressor = this.ctx.createDynamicsCompressor()
    compressor.threshold.value = -16
    compressor.ratio.value = 4
    this.output = this.ctx.createGain()
    this.output.gain.value = 0.35
    this.output.connect(compressor).connect(this.ctx.destination)
    this.noise = createPinkNoise(this.ctx, NOISE_SECONDS)
  }

  async resume(): Promise<boolean> {
    if (this.ctx.state !== 'running') await this.ctx.resume()
    return this.ctx.state === 'running'
  }

  setVolume(volume: number) {
    this.output.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.08)
  }

  startAmbience() {
    if (this.bed) return
    const { ctx } = this
    const t = ctx.currentTime
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(1, t + 1.5)
    gain.connect(this.output)

    const layer = (type: BiquadFilterType, freq: number, q: number, level: number) => {
      const source = this.source(true)
      const filter = ctx.createBiquadFilter()
      filter.type = type
      filter.frequency.value = freq
      filter.Q.value = q
      const layerGain = ctx.createGain()
      layerGain.gain.value = level
      source.connect(filter).connect(layerGain).connect(gain)
      source.start(t, Math.random() * NOISE_SECONDS)
      return { source, layerGain }
    }

    const swell = (target: AudioParam, rate: number, depth: number) => {
      const lfo = ctx.createOscillator()
      lfo.frequency.value = rate
      const depthGain = ctx.createGain()
      depthGain.gain.value = depth
      lfo.connect(depthGain).connect(target)
      lfo.start(t)
      return lfo
    }

    const rumble = layer('lowpass', 220, 0.7, 0.5)
    const murmur = layer('bandpass', 750, 0.8, 0.45)
    const chatter = layer('bandpass', 1900, 1.2, 0.12)
    const lfoA = swell(murmur.layerGain.gain, 0.11, 0.18)
    const lfoB = swell(chatter.layerGain.gain, 0.43, 0.06)

    this.bed = { gain, nodes: [rumble.source, murmur.source, chatter.source, lfoA, lfoB] }
  }

  stopAmbience() {
    if (!this.bed) return
    const { gain, nodes } = this.bed
    this.bed = null
    const t = this.ctx.currentTime
    gain.gain.cancelScheduledValues(t)
    gain.gain.setValueAtTime(gain.gain.value, t)
    gain.gain.linearRampToValueAtTime(0, t + 0.6)
    for (const node of nodes) node.stop(t + 0.7)
  }

  react(reaction: CrowdReaction) {
    switch (reaction) {
      case 'kickoff':
        this.whistle(0, 0.9)
        break
      case 'cheer':
        this.burst({ freq: 1100, q: 0.7, peak: 1, attack: 0.25, hold: 0.7, release: 2.4 })
        this.burst({ freq: 2400, q: 1, peak: 0.35, attack: 0.3, hold: 0.5, release: 1.8 })
        break
      case 'roar':
        this.burst({ freq: 800, toFreq: 1300, q: 0.6, peak: 1.6, attack: 0.15, hold: 2.2, release: 3.8 })
        this.burst({ freq: 2600, q: 0.9, peak: 0.5, attack: 0.2, hold: 1.8, release: 3 })
        this.burst({ freq: 180, q: 0.5, peak: 0.8, attack: 0.2, hold: 2, release: 3 })
        break
      case 'gasp':
        this.burst({ freq: 650, toFreq: 380, q: 1.4, peak: 0.8, attack: 0.08, hold: 0.25, release: 1.3 })
        break
      case 'queenSac':
        this.burst({ freq: 700, toFreq: 380, q: 1.4, peak: 1, attack: 0.08, hold: 0.3, release: 1.1 })
        this.burst({ freq: 1000, toFreq: 1400, q: 0.7, peak: 1.3, attack: 0.3, hold: 1.4, release: 2.8, delay: 1 })
        break
      case 'groan':
        this.burst({ freq: 480, toFreq: 240, q: 1.2, peak: 0.8, attack: 0.15, hold: 0.5, release: 1.8 })
        break
      case 'ooh':
        this.burst({ freq: 560, toFreq: 420, q: 1.3, peak: 0.5, attack: 0.12, hold: 0.3, release: 1 })
        break
      case 'fulltime':
        this.whistle(0, 0.35)
        this.whistle(0.5, 0.35)
        this.whistle(1, 1.3)
        this.burst({ freq: 1200, q: 0.6, peak: 1, attack: 0.6, hold: 1.5, release: 3, delay: 1.2 })
        break
    }
  }

  close() {
    this.bed = null
    void this.ctx.close()
  }

  private source(loop: boolean) {
    const source = this.ctx.createBufferSource()
    source.buffer = this.noise
    source.loop = loop
    return source
  }

  private burst({ freq, toFreq, q, peak, attack, hold, release, delay = 0 }: BurstOptions) {
    const { ctx } = this
    const t = ctx.currentTime + delay
    const end = t + attack + hold + release
    const source = this.source(false)
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = q
    filter.frequency.setValueAtTime(freq, t)
    if (toFreq) filter.frequency.exponentialRampToValueAtTime(toFreq, t + attack + hold)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.linearRampToValueAtTime(peak, t + attack)
    gain.gain.setValueAtTime(peak, t + attack + hold)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)
    source.connect(filter).connect(gain).connect(this.output)
    source.start(t, Math.random() * (NOISE_SECONDS - (end - t) - 0.2))
    source.stop(end + 0.05)
  }

  private whistle(delay: number, duration: number) {
    const { ctx } = this
    const t = ctx.currentTime + delay
    const tone = ctx.createOscillator()
    tone.frequency.value = 2950
    const trill = ctx.createOscillator()
    trill.frequency.value = 28
    const trillDepth = ctx.createGain()
    trillDepth.gain.value = 90
    trill.connect(trillDepth).connect(tone.frequency)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.03)
    gain.gain.setValueAtTime(0.22, t + duration - 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    tone.connect(gain).connect(this.output)
    tone.start(t)
    trill.start(t)
    tone.stop(t + duration + 0.05)
    trill.stop(t + duration + 0.05)
  }
}

export function reactionFor(frame: Frame): CrowdReaction | null {
  const queenMove = frame.san?.startsWith('Q') ?? false
  switch (frame.tag) {
    case 'KICK-OFF':
      return 'kickoff'
    case 'WINNER':
      return 'roar'
    case 'FULL TIME':
      return 'fulltime'
    case 'SACRIFICE':
    case 'GAMBLE':
      return queenMove ? 'queenSac' : 'gasp'
    case 'HOWLER':
    case 'STALEMATE':
      return 'groan'
    case 'CHECK':
      return 'ooh'
    case 'GOAL':
    case 'EQUALISER':
    case 'PROMOTION':
    case 'VAR CHECK':
    case 'BAIT TAKEN':
      return 'cheer'
    default:
      return null
  }
}
