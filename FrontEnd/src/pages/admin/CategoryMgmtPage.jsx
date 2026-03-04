import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, Switch, Upload, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import * as adminApi from '../../services/adminService'

export default function CategoryMgmtPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  const [imageList, setImageList] = useState([])

  const fetchData = () => { setLoading(true); adminApi.getCategories().then((r) => setCategories(r.categories)).finally(() => setLoading(false)) }
  useEffect(fetchData, [])

  const openCreate = () => { setEditing(null); form.resetFields(); setImageList([]); setModalOpen(true) }
  const openEdit = (r) => {
    setEditing(r)
    form.setFieldsValue(r)
    setImageList(r.image?.url ? [{ uid: '-1', url: r.image.url, public_id: r.image.public_id, status: 'done' }] : [])
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    try { await adminApi.deleteCategory(id); message.success('Đã xóa'); fetchData() } catch (e) { message.error(e.message) }
  }

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

      const payload = { ...values }
      if (imageBase64) payload.image = imageBase64

      if (editing) {
        await adminApi.updateCategory(editing._id, payload)
        message.success('Cập nhật thành công')
      } else {
        await adminApi.createCategory(payload)
        message.success('Tạo thành công')
      }
      setModalOpen(false)
      fetchData()
    } catch { /* validation */ } finally { setSubmitting(false) }
  }

  const columns = [
    { title: 'Ảnh', dataIndex: 'image', width: 60, render: (img) => img?.url ? <img src={img.url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} /> : '-' },
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Slug', dataIndex: 'slug' },
    { title: 'Trạng thái', dataIndex: 'isActive', render: (v) => v ? 'Hiển thị' : 'Ẩn' },
    { title: '', width: 100, render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
        <Popconfirm title="Xóa danh mục?" onConfirm={() => handleDelete(r._id)}><Button icon={<DeleteOutlined />} size="small" danger /></Popconfirm>
      </Space>
    )},
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý danh mục</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm danh mục</Button>
      </div>
      <Table columns={columns} dataSource={categories} rowKey="_id" loading={loading} pagination={false} />
      <Modal title={editing ? 'Sửa danh mục' : 'Thêm danh mục'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} confirmLoading={submitting} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Nhập tên' }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item label="Ảnh danh mục">
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
          <Form.Item name="isActive" label="Hiển thị" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
