import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Switch, Upload, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import * as adminApi from '../../services/adminService'

export default function BannerMgmtPage() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  const [imageList, setImageList] = useState([])

  const fetchData = () => { setLoading(true); adminApi.getBanners().then((r) => setBanners(r.banners)).finally(() => setLoading(false)) }
  useEffect(fetchData, [])

  const openCreate = () => { setEditing(null); form.resetFields(); setImageList([]); setModalOpen(true) }
  const openEdit = (r) => {
    setEditing(r)
    form.setFieldsValue({ ...r, type: r.type })
    setImageList(r.image?.url ? [{ uid: '-1', url: r.image.url, public_id: r.image.public_id, status: 'done' }] : [])
    setModalOpen(true)
  }

  const handleDelete = async (id) => { await adminApi.deleteBanner(id); message.success('Đã xóa'); fetchData() }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      let imageBase64 = null
      const file = imageList.find((f) => f.originFileObj)
      if (file) {
        imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(file.originFileObj)
        })
      }

      if (editing) {
        const payload = { ...values }
        if (imageBase64) payload.image = imageBase64
        else if (imageList.length === 0 && editing.image?.url) payload.image = ''
        await adminApi.updateBanner(editing._id, payload)
        message.success('Cập nhật thành công')
      } else {
        if (!imageBase64) return message.error('Vui lòng tải ảnh banner')
        await adminApi.createBanner({ ...values, image: imageBase64 })
        message.success('Tạo thành công')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      if (err?.message) message.error(err.message)
    } finally { setSubmitting(false) }
  }

  const columns = [
    { title: 'Ảnh', dataIndex: 'image', width: 120, render: (img) => img?.url ? <img src={img.url} alt="" style={{ width: 100, height: 50, objectFit: 'cover', borderRadius: 4 }} /> : '-' },
    { title: 'Tiêu đề', dataIndex: 'title' },
    { title: 'Loại', dataIndex: 'type' },
    { title: 'Thứ tự', dataIndex: 'order', width: 80 },
    { title: 'Hiển thị', dataIndex: 'isActive', width: 80, render: (v) => v ? 'Có' : 'Không' },
    { title: '', width: 100, render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
        <Popconfirm title="Xóa banner?" onConfirm={() => handleDelete(r._id)}><Button icon={<DeleteOutlined />} size="small" danger /></Popconfirm>
      </Space>
    )},
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý banner</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm banner</Button>
      </div>
      <Table columns={columns} dataSource={banners} rowKey="_id" loading={loading} pagination={false} />
      <Modal title={editing ? 'Sửa banner' : 'Thêm banner'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} confirmLoading={submitting} okText="Lưu" cancelText="Hủy" width={550}>
        <Form form={form} layout="vertical">
          <Form.Item label="Ảnh banner" required>
            <Upload
              listType="picture-card"
              fileList={imageList}
              onChange={({ fileList }) => setImageList(fileList.slice(-1))}
              beforeUpload={() => false}
              accept="image/*"
            >
              {imageList.length === 0 && <div><UploadOutlined /><div style={{ marginTop: 8 }}>Tải ảnh</div></div>}
            </Upload>
          </Form.Item>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="subtitle" label="Phụ đề"><Input /></Form.Item>
          <Form.Item name="link" label="Liên kết"><Input /></Form.Item>
          <Form.Item name="type" label="Loại" initialValue="home">
            <Select options={[{ label: 'Trang chủ', value: 'home' }, { label: 'Khuyến mãi', value: 'promotion' }, { label: 'Danh mục', value: 'category' }]} />
          </Form.Item>
          <Form.Item name="order" label="Thứ tự" initialValue={0}><InputNumber min={0} /></Form.Item>
          <Form.Item name="isActive" label="Hiển thị" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
