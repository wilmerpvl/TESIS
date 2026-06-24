import React from "react";

function PreviewCanvas({ canvasRef }) {

    return (

        <div className="card">

            <h3>
                Vista previa de cortes
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