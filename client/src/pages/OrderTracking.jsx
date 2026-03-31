import { Link } from "react-router-dom";
export default function OrderTracking() {
  return (
    <div className="section">
      <div className="container flex-center" style={{flexDirection:"column",gap:"16px",minHeight:"400px"}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.8rem"}}>OrderTracking</h2>
        <p style={{color:"var(--text-muted)"}}>This page is ready to be built out.</p>
        <Link to="/" className="btn btn-primary">← Back Home</Link>
      </div>
    </div>
  );
}
