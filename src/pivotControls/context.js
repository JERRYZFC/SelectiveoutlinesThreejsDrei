import * as React from "react"

export const context = React.createContext(null)

const isRef = object => object && object.current
export const resolveObject = (object, fallback) =>
  isRef(object)
    ? object.current
    : object
      ? object
      : fallback
        ? resolveObject(fallback)
        : undefined
