import React from 'react'

type SliderProps = {
  value: number[]
  onValueChange: (v: number[]) => void
  max?: number
  min?: number
  step?: number
  className?: string
}

export const Slider: React.FC<SliderProps> = ({ value, onValueChange, max = 100, min = 0, step = 1, className }) => {
  const v = Array.isArray(value) ? value[0] ?? 0 : (value as unknown as number)

  return (
    <div className={className}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => onValueChange([Number(e.target.value)])}
        className="w-full"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={v}
      />
    </div>
  )
}

export default Slider
