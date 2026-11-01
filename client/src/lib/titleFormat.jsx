import React from 'react'

const APP_NAME = 'SHOT Cafe POS'

export default function titleFormat(title) {
  return (
    <p>
      {title} - ${APP_NAME}
    </p>
  )
}
