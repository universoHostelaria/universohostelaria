import { useEffect, useRef } from 'react'
import './index.css'
import { useScrollReveal } from './hooks/useScrollReveal'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Benefits from './components/Benefits'
import Audience from './components/Audience'
import Catalog from './components/Catalog'
import CTA from './components/CTA'
import Footer from './components/Footer'

function CustomCursor() {
  const cursorRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    let mouseX = 0, mouseY = 0
    let ringX = 0, ringY = 0
    let raf

    const onMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (cursorRef.current) {
        cursorRef.current.style.left = mouseX + 'px'
        cursorRef.current.style.top = mouseY + 'px'
      }
    }

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      if (ringRef.current) {
        ringRef.current.style.left = ringX + 'px'
        ringRef.current.style.top = ringY + 'px'
      }
      raf = requestAnimationFrame(animateRing)
    }

    const onEnterLink = () => {
      cursorRef.current?.classList.add('hover')
      ringRef.current?.classList.add('hover')
    }
    const onLeaveLink = () => {
      cursorRef.current?.classList.remove('hover')
      ringRef.current?.classList.remove('hover')
    }

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(animateRing)

    const addHoverListeners = () => {
      document.querySelectorAll('a, button').forEach((el) => {
        el.addEventListener('mouseenter', onEnterLink)
        el.addEventListener('mouseleave', onLeaveLink)
      })
    }

    addHoverListeners()
    const mutationObserver = new MutationObserver(addHoverListeners)
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      mutationObserver.disconnect()
    }
  }, [])

  return (
    <>
      <div className="cursor" ref={cursorRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  )
}

export default function App() {
  useScrollReveal()

  return (
    <>
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <Audience />
        <Catalog />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
