import { useRef } from 'react';
export default function Carousel({ children, className = '' }) {
  const ref = useRef();
  const by = (d) => { const el = ref.current; el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: 'smooth' }); };
  return (
    <div className={'carousel ' + className}>
      <button className="car-btn prev" aria-label="Previous" onClick={() => by(-1)}>‹</button>
      <div className="car-track" ref={ref}>{children}</div>
      <button className="car-btn next" aria-label="Next" onClick={() => by(1)}>›</button>
    </div>
  );
}
