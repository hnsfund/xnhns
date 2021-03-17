import React from "react";
import { Link } from "react-router-dom";
import { Modal, Typography, Button } from "antd";
const { Text } = Typography;

export default function Migrate({
  setupNextMigration,
  closeModal,
  txStatus,
  migratedNode,
  networkName,
}) {
  if(!txStatus) return null
  return txStatus !== 'success' ? (
    <Modal
      visible centered
      cancelText='Close'
      okText={null}
      afterClose={closeModal}
    >
      <h2> There was a problem submitting your migration request </h2>
      <h4> {txStatus} </h4>
    </Modal>
  ) : (
    <Modal
      visible centered
      cancelText='Migrate Another TLD'
      onCancel={setupNextMigration}
      okText={
        <Link to={`/manage/${migratedNode}`}>
          <Button>
            View Migration
          </Button>
        </Link>
      }
      afterClose={closeModal}
    >
      <h2> Your TLD is being migrated to {networkName}! </h2>
      <h4>'Once we\'re done, you will submit one more transactio nto mint your NFTLD'</h4>
    </Modal>
  )
}
