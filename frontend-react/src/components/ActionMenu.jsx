import { useState, useRef, useEffect } from "react";

export default function ActionMenu({
  onEdit,
  onDelete,
  onActivate,
  estado = 1,
  editLabel = "Editar",
  deleteLabel = "Inactivar",
  activateLabel = "Activar",
  children
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="action-menu-container" ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className="action-menu-btn"
        onClick={() => setOpen(!open)}
        title="Más opciones"
        style={{
          background: "none",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          width: "36px",
          height: "36px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: "bold",
          color: "#475569",
          transition: "all 0.2s ease"
        }}
      >
        ⋮
      </button>

      {open && (
        <div
          className="action-menu-dropdown"
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: "6px",
            width: "160px",
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15), 0 2px 5px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0",
            zIndex: 999,
            overflow: "hidden",
            padding: "4px 0"
          }}
        >
          {children ? (
            typeof children === "function" ? children(() => setOpen(false)) : children
          ) : (
            <>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onEdit();
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <span style={{ fontSize: "14px" }}>✏️</span> {editLabel}
                </button>
              )}

              {estado ? (
                onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onDelete();
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <span style={{ fontSize: "14px" }}>🗑️</span> {deleteLabel}
                  </button>
                )
              ) : (
                onActivate && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onActivate();
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#166534",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0fdf4")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <span style={{ fontSize: "14px" }}>✔️</span> {activateLabel}
                  </button>
                )
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
