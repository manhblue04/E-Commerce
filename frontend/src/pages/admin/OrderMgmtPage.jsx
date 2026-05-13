import { useState, useEffect } from 'react'
import { Table, Tag, Select, Button, Input, Modal, Descriptions, Steps, Divider, Avatar, message } from 'antd'
import { EyeOutlined, SearchOutlined, DownloadOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, CarOutlined, SmileOutlined, CloseCircleOutlined } from '@ant-design/icons'
import * as adminApi from '../../services/adminService'
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from '../../utils/constants'

const NEXT_STATUS = { pending: 'processing', processing: 'shipping', shipping: 'delivered' }

const LOG_STEPS = [
  { key: 'pending', label: 'Chờ xác nhận', icon: <ClockCircleOutlined /> },
  { key: 'processing', label: 'Đang xử lý', icon: <SyncOutlined /> },
  { key: 'shipping', label: 'Đang giao', icon: <CarOutlined /> },
  { key: 'delivered', label: 'Đã nhận', icon: <SmileOutlined /> },
]

function OrderDetailModal({ detail }) {
  const { order, logs = [] } = detail
  const isCancelled = order.orderStatus === 'cancelled'
  const addr = order.shippingAddress || {}
  const currentIdx = LOG_STEPS.findIndex((s) => s.key === order.orderStatus)

  return (
    <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
      {/* Customer */}
      <Descriptions column={2} size="small" bordered title="Thông tin khách hàng" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Họ tên">{order.user?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Email">{order.user?.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="Điện thoại">{addr.phone || order.user?.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="Người nhận">{addr.fullName || '-'}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ" span={2}>
          {[addr.addressLine, addr.ward, addr.district, addr.city].filter(Boolean).join(', ') || '-'}
        </Descriptions.Item>
      </Descriptions>

      {/* Items */}
      <Divider orientation="left" style={{ fontSize: 14 }}>Sản phẩm ({order.orderItems?.length})</Divider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {order.orderItems?.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Avatar shape="square" size={48} src={item.image} style={{ flexShrink: 0, borderRadius: 6 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
              <div style={{ fontSize: 12, color: '#888' }}>
                {item.size && `Size: ${item.size}`}{item.size && item.color && ' · '}{item.color && `Màu: ${item.color}`}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 13 }}>{item.price?.toLocaleString('vi-VN')}₫ × {item.quantity}</div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{(item.price * item.quantity)?.toLocaleString('vi-VN')}₫</div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment & Pricing */}
      <Descriptions column={2} size="small" bordered title="Thanh toán" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Phương thức">{PAYMENT_METHOD[order.paymentMethod] || order.paymentMethod}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái TT">
          <Tag color={PAYMENT_STATUS[order.paymentStatus]?.color}>{PAYMENT_STATUS[order.paymentStatus]?.label}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Tạm tính">{order.itemsPrice?.toLocaleString('vi-VN')}₫</Descriptions.Item>
        <Descriptions.Item label="Phí vận chuyển">{order.shippingPrice === 0 ? 'Miễn phí' : `${order.shippingPrice?.toLocaleString('vi-VN')}₫`}</Descriptions.Item>
        {order.discountPrice > 0 && <Descriptions.Item label="Giảm giá"><span style={{ color: '#52c41a' }}>-{order.discountPrice?.toLocaleString('vi-VN')}₫</span></Descriptions.Item>}
        {order.taxPrice > 0 && <Descriptions.Item label="Thuế">{order.taxPrice?.toLocaleString('vi-VN')}₫</Descriptions.Item>}
        <Descriptions.Item label="Tổng cộng"><strong style={{ color: '#d48806', fontSize: 15 }}>{order.totalPrice?.toLocaleString('vi-VN')}₫</strong></Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">{new Date(order.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
        {order.paidAt && <Descriptions.Item label="Thanh toán lúc">{new Date(order.paidAt).toLocaleString('vi-VN')}</Descriptions.Item>}
        {order.deliveredAt && <Descriptions.Item label="Giao hàng lúc">{new Date(order.deliveredAt).toLocaleString('vi-VN')}</Descriptions.Item>}
        {order.coupon && <Descriptions.Item label="Mã giảm giá">{order.coupon.code}</Descriptions.Item>}
      </Descriptions>

      {/* Order Timeline */}
      <Divider orientation="left" style={{ fontSize: 14 }}>Lịch sử trạng thái</Divider>
      {isCancelled ? (
        <div style={{ padding: '12px 16px', background: '#fff2f0', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
          <div>
            <div style={{ fontWeight: 500, color: '#cf1322' }}>Đơn hàng đã bị hủy</div>
            {logs.find((l) => l.status === 'cancelled') && (
              <div style={{ fontSize: 12, color: '#ff7875' }}>
                {new Date(logs.find((l) => l.status === 'cancelled').changedAt).toLocaleString('vi-VN')}
                {logs.find((l) => l.status === 'cancelled').note && ` — ${logs.find((l) => l.status === 'cancelled').note}`}
              </div>
            )}
          </div>
        </div>
      ) : (
        <Steps
          current={currentIdx}
          size="small"
          items={LOG_STEPS.map((step) => {
            const log = logs.find((l) => l.status === step.key)
            return {
              title: step.label,
              icon: step.icon,
              description: log
                ? new Date(log.changedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                : undefined,
            }
          })}
        />
      )}
    </div>
  )
}

export default function OrderMgmtPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('')
  const [keyword, setKeyword] = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [detail, setDetail] = useState(null)

  const fetchOrders = async (p = 1) => {
    setLoading(true)
    const params = { page: p, limit: 15 }
    if (filter) params.status = filter
    if (keyword) params.keyword = keyword
    adminApi.getOrders(params).then((r) => { setOrders(r.orders); setTotal(r.total) }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders(page) }, [page, filter, keyword])

  const handleSearch = () => { setKeyword(searchVal); setPage(1) }

  const handleStatusChange = async (id, status) => {
    try { await adminApi.updateOrderStatus(id, { status }); message.success('Cập nhật thành công'); fetchOrders(page) } catch (e) { message.error(e.message) }
  }

  const columns = [
    { title: 'Mã', dataIndex: '_id', width: 100, render: (id) => `#${id.slice(-6).toUpperCase()}` },
    { title: 'Khách hàng', dataIndex: 'user', render: (u) => u?.name || u?.email || '-' },
    { title: 'Tổng tiền', dataIndex: 'totalPrice', render: (v) => `${v?.toLocaleString('vi-VN')}₫` },
    { title: 'Thanh toán', dataIndex: 'paymentMethod', render: (v) => PAYMENT_METHOD[v] },
    { title: 'TT thanh toán', dataIndex: 'paymentStatus', render: (s) => <Tag color={PAYMENT_STATUS[s]?.color}>{PAYMENT_STATUS[s]?.label}</Tag> },
    { title: 'Trạng thái', dataIndex: 'orderStatus', render: (s) => <Tag color={ORDER_STATUS[s]?.color}>{ORDER_STATUS[s]?.label}</Tag> },
    { title: 'Ngày', dataIndex: 'createdAt', render: (d) => new Date(d).toLocaleDateString('vi-VN') },
    {
      title: '', width: 150,
      render: (_, r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button icon={<EyeOutlined />} size="small" onClick={async () => {
            const res = await adminApi.getOrderDetail(r._id)
            setDetail(res)
          }} />
          {NEXT_STATUS[r.orderStatus] && (
            <Button size="small" type="primary" onClick={() => handleStatusChange(r._id, NEXT_STATUS[r.orderStatus])}>
              {ORDER_STATUS[NEXT_STATUS[r.orderStatus]]?.label}
            </Button>
          )}
          {['pending', 'processing'].includes(r.orderStatus) && (
            <Button size="small" danger onClick={() => handleStatusChange(r._id, 'cancelled')}>Hủy</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý đơn hàng</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input.Search
            placeholder="Tìm theo tên, SĐT khách..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 260 }}
            enterButton={<SearchOutlined />}
            allowClear
            onClear={() => { setSearchVal(''); setKeyword(''); setPage(1) }}
          />
          <Select placeholder="Trạng thái" allowClear style={{ width: 160 }} onChange={(v) => { setFilter(v || ''); setPage(1) }}
            options={Object.entries(ORDER_STATUS).map(([k, v]) => ({ label: v.label, value: k }))} />
          <Button icon={<DownloadOutlined />} onClick={() => adminApi.exportCsv('orders')}>Export</Button>
        </div>
      </div>
      <Table columns={columns} dataSource={orders} rowKey="_id" loading={loading} pagination={{ current: page, total, pageSize: 15, onChange: setPage }} size="small" scroll={{ x: 1000 }} />

      <Modal title={`Chi tiết đơn hàng #${detail?.order?._id?.slice(-6).toUpperCase() || ''}`} open={!!detail} onCancel={() => setDetail(null)} footer={null} width={720}>
        {detail && <OrderDetailModal detail={detail} />}
      </Modal>
    </div>
  )
}
