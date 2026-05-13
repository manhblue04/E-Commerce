import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Switch, Upload, DatePicker, Popconfirm, Tag, message, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, ThunderboltOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as adminApi from '../../services/adminService'
import { formatPrice } from '../../utils/formatPrice'

const { RangePicker } = DatePicker

const SALE_TYPE_MAP = {
  flash_sale: { label: 'Flash Sale', color: 'red' },
  seasonal: { label: 'Theo mùa', color: 'blue' },
  clearance: { label: 'Xả hàng', color: 'orange' },
}

function getSaleStatus(sale) {
  const now = dayjs()
  const start = dayjs(sale.startDate)
  const end = dayjs(sale.endDate)
  if (!sale.isActive) return { label: 'Tắt', color: 'default' }
  if (now.isBefore(start)) return { label: 'Sắp diễn ra', color: 'gold' }
  if (now.isAfter(end)) return { label: 'Đã kết thúc', color: 'default' }
  return { label: 'Đang diễn ra', color: 'green' }
}

export default function SaleMgmtPage() {
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()
  const [bannerList, setBannerList] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const fetchSales = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const [salesRes, prodRes] = await Promise.all([
        adminApi.getSales({ page: p, limit: 20 }),
        adminApi.getProducts({ limit: 999 }),
      ])
      setSales(salesRes.sales)
      setTotal(salesRes.total)
      setProducts(prodRes.products)
    } catch { /* empty */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSales(page) }, [page, fetchSales])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true, discountType: 'percent' })
    setBannerList([])
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({
      ...record,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
      products: record.products?.map((p) => p._id || p) || [],
    })
    setBannerList(record.banner?.url ? [{ uid: '-1', url: record.banner.url, status: 'done' }] : [])
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    await adminApi.deleteSale(id)
    message.success('Đã xóa chương trình sale')
    fetchSales(page)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      const payload = {
        name: values.name,
        description: values.description || '',
        type: values.type,
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscountAmount: values.maxDiscountAmount || 0,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        products: values.products || [],
        isActive: values.isActive,
      }

      if (bannerList[0]?.originFileObj) {
        const b64 = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(bannerList[0].originFileObj)
        })
        payload.banner = b64
      }

      if (editing && bannerList.length === 0 && editing.banner?.url) {
        payload.removeBanner = true
      }

      if (editing) {
        await adminApi.updateSale(editing._id, payload)
        message.success('Cập nhật thành công')
      } else {
        await adminApi.createSale(payload)
        message.success('Tạo chương trình sale thành công')
      }

      setModalOpen(false)
      fetchSales(page)
    } catch { /* validation */ } finally { setSubmitting(false) }
  }

  const columns = [
    {
      title: 'Banner', dataIndex: 'banner', width: 80,
      render: (b) => b?.url ? <img src={b.url} alt="" style={{ width: 60, height: 36, objectFit: 'cover', borderRadius: 4 }} /> : '-',
    },
    { title: 'Tên', dataIndex: 'name', ellipsis: true },
    {
      title: 'Loại', dataIndex: 'type', width: 110,
      render: (v) => { const t = SALE_TYPE_MAP[v]; return t ? <Tag color={t.color}>{t.label}</Tag> : v },
    },
    {
      title: 'Giảm', width: 120,
      render: (_, r) => r.discountType === 'percent' ? `${r.discountValue}%` : formatPrice(r.discountValue),
    },
    {
      title: 'Thời gian', width: 200,
      render: (_, r) => `${dayjs(r.startDate).format('DD/MM/YY HH:mm')} → ${dayjs(r.endDate).format('DD/MM/YY HH:mm')}`,
    },
    {
      title: 'Sản phẩm', dataIndex: 'products', width: 90,
      render: (p) => p?.length || 0,
    },
    {
      title: 'Trạng thái', width: 120,
      render: (_, r) => { const s = getSaleStatus(r); return <Tag color={s.color}>{s.label}</Tag> },
    },
    {
      title: '', width: 100,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title="Xóa chương trình sale này?" onConfirm={() => handleDelete(record._id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const discountType = Form.useWatch('discountType', form)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThunderboltOutlined /> Quản lý khuyến mãi
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Tạo chương trình</Button>
      </div>

      <Table columns={columns} dataSource={sales} rowKey="_id" loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }} size="small" scroll={{ x: 900 }} />

      <Modal title={editing ? 'Sửa chương trình sale' : 'Tạo chương trình sale'} open={modalOpen} onOk={handleSubmit}
        onCancel={() => setModalOpen(false)} confirmLoading={submitting} width={640} okText="Lưu" cancelText="Hủy" destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên chương trình" rules={[{ required: true, message: 'Nhập tên' }]}>
            <Input placeholder="VD: Flash Sale Cuối Tuần" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="type" label="Loại" rules={[{ required: true, message: 'Chọn loại' }]}>
              <Select options={[
                { label: 'Flash Sale', value: 'flash_sale' },
                { label: 'Theo mùa', value: 'seasonal' },
                { label: 'Xả hàng', value: 'clearance' },
              ]} />
            </Form.Item>
            <Form.Item name="dateRange" label="Thời gian" rules={[{ required: true, message: 'Chọn thời gian' }]}>
              <RangePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Form.Item name="discountType" label="Loại giảm" rules={[{ required: true }]}>
              <Select options={[{ label: 'Phần trăm (%)', value: 'percent' }, { label: 'Số tiền cố định', value: 'fixed' }]} />
            </Form.Item>
            <Form.Item name="discountValue" label="Giá trị" rules={[{ required: true, message: 'Nhập giá trị' }]}>
              <InputNumber style={{ width: '100%' }} min={0} max={discountType === 'percent' ? 100 : undefined}
                formatter={(v) => discountType === 'percent' ? `${v}` : `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                addonAfter={discountType === 'percent' ? '%' : '₫'} />
            </Form.Item>
            <Form.Item name="maxDiscountAmount" label="Giảm tối đa">
              <InputNumber style={{ width: '100%' }} min={0} disabled={discountType !== 'percent'}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} addonAfter="₫" />
            </Form.Item>
          </div>

          <Form.Item name="products" label="Sản phẩm áp dụng" rules={[{ required: true, message: 'Chọn ít nhất 1 sản phẩm' }]}>
            <Select mode="multiple" placeholder="Tìm và chọn sản phẩm..." optionFilterProp="label" showSearch
              options={products.map((p) => ({ label: `${p.name} — ${formatPrice(p.price)}`, value: p._id }))}
              maxTagCount={5} maxTagPlaceholder={(omitted) => `+${omitted.length} sản phẩm`} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} placeholder="Mô tả chương trình (tùy chọn)" /></Form.Item>

          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>

          <Form.Item label="Banner (tùy chọn)">
            <Upload listType="picture-card" fileList={bannerList} onChange={({ fileList }) => setBannerList(fileList.slice(-1))}
              beforeUpload={() => false} accept="image/*" maxCount={1}>
              {bannerList.length === 0 && <div><UploadOutlined /><div style={{ marginTop: 8 }}>Tải ảnh</div></div>}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
