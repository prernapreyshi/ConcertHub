"use client"

import { useEffect, useRef } from "react"

interface BarcodeProps {
  value: string
  width?: number
  height?: number
}

// Code 128 encoding patterns
const CODE128_PATTERNS: Record<string, string> = {
  " ": "11011001100",
  "!": "11001101100",
  '"': "11001100110",
  "#": "10010011000",
  $: "10010001100",
  "%": "10001001100",
  "&": "10011001000",
  "'": "10011000100",
  "(": "10001100100",
  ")": "11001001000",
  "*": "11001000100",
  "+": "11000100100",
  ",": "10110011100",
  "-": "10011011100",
  ".": "10011001110",
  "/": "10111001100",
  "0": "10011101100",
  "1": "10011100110",
  "2": "11001110010",
  "3": "11001011100",
  "4": "11001001110",
  "5": "11011100100",
  "6": "11001110100",
  "7": "11101101110",
  "8": "11101001100",
  "9": "11100101100",
  ":": "11100100110",
  ";": "11101100100",
  "<": "11100110100",
  "=": "11100110010",
  ">": "11011011000",
  "?": "11011000110",
  "@": "11000110110",
  A: "10100011000",
  B: "10001011000",
  C: "10001000110",
  D: "10110001000",
  E: "10001101000",
  F: "10001100010",
  G: "11010001000",
  H: "11000101000",
  I: "11000100010",
  J: "10110111000",
  K: "10110001110",
  L: "10001101110",
  M: "10111011000",
  N: "10111000110",
  O: "10001110110",
  P: "11101110110",
  Q: "11010001110",
  R: "11000101110",
  S: "11011101000",
  T: "11011100010",
  U: "11011101110",
  V: "11101011000",
  W: "11101000110",
  X: "11100010110",
  Y: "11101101000",
  Z: "11101100010",
  "[": "11100011010",
  "\\": "11101111010",
  "]": "11001000010",
  "^": "11110001010",
  _: "10100110000",
  "`": "10100001100",
  a: "10010110000",
  b: "10010000110",
  c: "10000101100",
  d: "10000100110",
  e: "10110010000",
  f: "10110000100",
  g: "10011010000",
  h: "10011000010",
  i: "10000110100",
  j: "10000110010",
  k: "11000010010",
  l: "11001010000",
  m: "11110111010",
  n: "11000010100",
  o: "10001111010",
  p: "10100111100",
  q: "10010111100",
  r: "10010011110",
  s: "10111100100",
  t: "10011110100",
  u: "10011110010",
  v: "11110100100",
  w: "11110010100",
  x: "11110010010",
  y: "11011011110",
  z: "11011110110",
  "{": "11110110110",
  "|": "10101111000",
  "}": "10100011110",
  "~": "10001011110",
}

const START_CODE_B = "11010010000"
const STOP_CODE = "1100011101011"

function encodeCode128B(text: string): string {
  let encoded = START_CODE_B
  let checksum = 104 // Start B value

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const pattern = CODE128_PATTERNS[char]
    if (pattern) {
      encoded += pattern
      checksum += (i + 1) * (char.charCodeAt(0) - 32)
    }
  }

  // Add checksum
  const checksumValue = checksum % 103
  const checksumChar = String.fromCharCode(checksumValue + 32)
  encoded += CODE128_PATTERNS[checksumChar] || CODE128_PATTERNS[" "]

  encoded += STOP_CODE

  return encoded
}

export function Barcode({ value, width = 280, height = 80 }: BarcodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const encoded = encodeCode128B(value)
    const barWidth = width / encoded.length

    // Clear canvas
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, width, height)

    // Draw bars
    ctx.fillStyle = "#1a1a1a"
    for (let i = 0; i < encoded.length; i++) {
      if (encoded[i] === "1") {
        ctx.fillRect(i * barWidth, 0, barWidth, height)
      }
    }
  }, [value, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="max-w-full"
      aria-label={`Barcode for ${value}`}
    />
  )
}
