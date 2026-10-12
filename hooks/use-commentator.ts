'use client'

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import type { Intensity } from '@/lib/commentary/engine'

const DELIVERY: Record<Intensity, { rate: number; pitch: number }> = {
  calm: { rate: 1.02, pitch: 1 },
  buildup: { rate: 1.08, pitch: 1.05 },
  big: { rate: 1.16, pitch: 1.15 },
  goal: { rate: 1.22, pitch: 1.25 },
}

const PIECES: Record<string, string> = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight' }

const VOICE_PREFERENCES = [/Google UK English Male/i, /Daniel/i, /Arthur/i, /en-GB/i, /Google US English/i, /Alex/i]

const noopSubscribe = () => () => {}

export function toSpeakable(text: string): string {
  return text
    .replace(/\bO-O-O\b/g, 'castles queenside')
    .replace(/\bO-O\b/g, 'castles kingside')
    .replace(
      /\b([KQRBN])?([a-h1-8])?(x)?([a-h][1-8])(?:=([QRBN]))?([+#])?/g,
      (_m, piece?: string, _from?: string, takes?: string, square?: string, promo?: string, check?: string) =>
        [
          piece ? PIECES[piece] : takes ? 'pawn' : '',
          takes ? 'takes' : '',
          square,
          promo ? `promotes to ${PIECES[promo]}` : '',
          check === '#' ? 'checkmate' : check === '+' ? 'check' : '',
        ]
          .filter(Boolean)
          .join(' '),
    )
    .replace(/(\d+)\+(\d+)'/g, '$1 plus $2')
    .replace(/(\d+)'/g, '$1 minutes')
    .replace(/\b[A-Z]{2,}\b/g, (word) => word.toLowerCase())
}

function chooseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = voices.filter((v) => /^en/i.test(v.lang))
  for (const pref of VOICE_PREFERENCES) {
    const match = english.find((v) => pref.test(v.name) || pref.test(v.lang))
    if (match) return match
  }
  return english[0] ?? voices[0] ?? null
}

export interface SpeakOptions {
  volume: number
  rateMultiplier: number
}

/** Browser text-to-speech narrator. `speak` returns a stop function; `onDone` fires once per line. */
export function useCommentator() {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => 'speechSynthesis' in window,
    () => false,
  )
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (!supported) return
    const synth = window.speechSynthesis
    const pick = () => {
      voiceRef.current = chooseVoice(synth.getVoices())
    }
    pick()
    synth.addEventListener('voiceschanged', pick)
    return () => {
      synth.removeEventListener('voiceschanged', pick)
      synth.cancel()
    }
  }, [supported])

  const prime = useCallback(() => {
    if (!('speechSynthesis' in window)) return
    const warmup = new SpeechSynthesisUtterance(' ')
    warmup.volume = 0
    window.speechSynthesis.speak(warmup)
  }, [])

  const speak = useCallback(
    (text: string, intensity: Intensity, { volume, rateMultiplier }: SpeakOptions, onDone: () => void) => {
      const synth = window.speechSynthesis
      synth.cancel()
      const spoken = toSpeakable(text)
      const delivery = DELIVERY[intensity]
      const utterance = new SpeechSynthesisUtterance(spoken)
      if (voiceRef.current) {
        utterance.voice = voiceRef.current
        utterance.lang = voiceRef.current.lang
      } else {
        utterance.lang = 'en-GB'
      }
      utterance.rate = Math.min(2, delivery.rate * rateMultiplier)
      utterance.pitch = delivery.pitch
      utterance.volume = volume

      let settled = false
      const words = spoken.split(/\s+/).length
      // Some engines never fire `end`; never let narration stall playback.
      const safety = setTimeout(() => finish(), (words * 420) / utterance.rate + 2500)
      function finish() {
        if (settled) return
        settled = true
        clearTimeout(safety)
        onDone()
      }
      utterance.onend = finish
      utterance.onerror = finish
      utteranceRef.current = utterance
      synth.speak(utterance)

      return () => {
        settled = true
        clearTimeout(safety)
        if (utteranceRef.current === utterance) synth.cancel()
      }
    },
    [],
  )

  return { supported, speak, prime }
}
