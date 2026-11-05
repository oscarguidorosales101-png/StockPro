import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Confirmar eliminación?',
  message = '¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.',
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  isLoading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.5rem 0' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: 'var(--danger-bg)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertTriangle size={22} />
        </div>
        <div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 500 }}>
            {message}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Si el registro cuenta con operaciones u otros datos vinculados en el sistema, no podrá eliminarse para proteger la información.
          </p>
        </div>
      </div>
      <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Eliminando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

