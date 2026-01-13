import React from 'react';

const EquipmentCard = ({ equipment, onClick, showActions = false, onEdit = null, onDelete = null }) => {
  return (
    <div className="equipment-card" onClick={onClick}>
      <div className="equipment-icon">🔧</div>

      <h3 className="equipment-name">{equipment.nome}</h3>

      <p className="equipment-description">
        {equipment.descricao || 'Sem descrição'}
      </p>

      <div className="equipment-info">
        <div className="info-item">
          <span className="label">Quantidade:</span>
          <span className="value">{equipment.quantidade}</span>
        </div>

        {!equipment.ativo && (
          <div className="info-item">
            <span className="badge-inactive">Inativo</span>
          </div>
        )}
      </div>

      {showActions && onEdit && onDelete && (
        <div className="equipment-actions">
          <button
            className="btn btn-sm btn-info"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(equipment);
            }}
          >
            ✏️ Editar
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(equipment._id);
            }}
          >
            🗑️ Deletar
          </button>
        </div>
      )}
    </div>
  );
};

export default EquipmentCard;
