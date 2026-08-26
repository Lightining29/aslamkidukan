import AtmReceiptDispenser from './AtmReceiptDispenser';
import './OrderReceiptModal.css';

export default function OrderReceiptModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="aaan-receipt-modal-backdrop" onClick={onClose}>
      <div className="aaan-atm-modal-container" onClick={(e) => e.stopPropagation()}>
        <AtmReceiptDispenser
          order={order}
          onBack={onClose}
          onDownload={() => window.print()}
        />
      </div>
    </div>
  );
}
