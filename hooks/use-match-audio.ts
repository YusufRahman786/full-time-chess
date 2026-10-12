'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Frame } from '@/lib/commentary/engine'
import { CrowdEngine, reactionFor } from '@/lib/audio/crowd-engine'
import { useCommentator } from './use-commentator'

const RATE_FOR_SPEED: Record<number, number> = { 1: 1, 2: 1.2, 4: 1.4 }

export function useMatchAudio(playing: boolean) {
  const commentator = useCommentator()
  const crowdRef = useRef<CrowdEngine | null>(null)
  const voiceVolumeRef = useRef(1)

  const [soundOn, setSoundOn] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [voiceMuted, setVoiceMuted] = useState(false)
  const [voiceVolume, setVoiceVolumeState] = useState(1)
  const [crowdMuted, setCrowdMuted] = useState(false)
  const [crowdVolume, setCrowdVolume] = useState(0.35)

  const voiceActive = soundOn && commentator.supported && !voiceMuted && voiceVolume > 0
  const crowdActive = soundOn && !blocked && !crowdMuted && crowdVolume > 0

  const enable = useCallback(async () => {
    // Must run synchronously inside the click so mobile browsers unlock speech.
    commentator.prime()
    try {
      crowdRef.current ??= new CrowdEngine()
      const running = await crowdRef.current.resume()
      setBlocked(!running)
    } catch {
      setBlocked(true)
    }
    setSoundOn(true)
  }, [commentator])

  const disable = useCallback(() => {
    setSoundOn(false)
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])

  const setVoiceVolume = useCallback((volume: number) => {
    voiceVolumeRef.current = volume
    setVoiceVolumeState(volume)
  }, [])

  useEffect(() => {
    const crowd = crowdRef.current
    if (!crowd) return
    if (crowdActive && playing) crowd.startAmbience()
    else crowd.stopAmbience()
  }, [crowdActive, playing])

  useEffect(() => {
    crowdRef.current?.setVolume(crowdVolume)
  }, [crowdVolume, soundOn])

  useEffect(
    () => () => {
      crowdRef.current?.close()
      crowdRef.current = null
    },
    [],
  )

  const { speak } = commentator
  const narrate = useCallback(
    (frame: Frame, speed: number, onDone: () => void) =>
      speak(
        frame.text,
        frame.intensity,
        { volume: voiceVolumeRef.current, rateMultiplier: RATE_FOR_SPEED[speed] ?? 1 },
        onDone,
      ),
    [speak],
  )

  const react = useCallback((frame: Frame) => {
    const reaction = reactionFor(frame)
    if (reaction) crowdRef.current?.react(reaction)
  }, [])

  return {
    speechSupported: commentator.supported,
    soundOn,
    blocked,
    voiceActive,
    crowdActive,
    voiceMuted,
    voiceVolume,
    crowdMuted,
    crowdVolume,
    enable,
    disable,
    setVoiceMuted,
    setVoiceVolume,
    setCrowdMuted,
    setCrowdVolume,
    narrate,
    react,
  }
}

export type MatchAudio = ReturnType<typeof useMatchAudio>
