import React from "react";

function PreviewCanvas({ canvasRef }) {

    return (

        <div style={{ marginBottom: "25px", paddingBottom: "20px", borderBottom: "1px solid #e2e8f0" }}>

            <h3 style={{ fontSize: "16px", color: "#1e293b", fontWeight: "700", marginBottom: "12px" }}>
                6. Vista Previa de Cortes
            </h3>

            <canvas
                ref={canvasRef}
                width="1200"
                height="700"
            />

        </div>

    );

}

export default PreviewCanvas;