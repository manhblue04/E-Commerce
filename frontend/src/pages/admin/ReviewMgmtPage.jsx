import { useState, useEffect } from 'react'
import { Table, Button, Rate, Select, Popconfirm, message } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import * as adminApi from '../../services/adminService'

export default function ReviewMgmtPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [ratingFilter, setRatingFilter] = useState('')

  const fetchReviews = (p = 1) => {
    setLoading(true)
    const params = { page: p, limit: 20 }
    if (ratingFilter) params.rating = ratingFilter
    adminApi.getReviews(params).then((r) => { setReviews(r.reviews); setTotal(r.total) }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchReviews(page) }, [page, ratingFilter])

  const handleDelete = async (id) => { await adminApi.deleteReview(id); message.success('Đã xóa'); fetchReviews(page) }

  const columns = [
    { title: 'Người dùng', dataIndex: 'user', render: (u) => u?.name || u?.email || '-' },
    { title: 'Sản phẩm', dataIndex: 'product', render: (p) => p?.name || '-' },
    { title: 'Điểm', dataIndex: 'rating', render: (v) => <Rate disabled value={v} style={{ fontSize: 14 }} /> },
    { title: 'Nhận xét', dataIndex: 'comment', ellipsis: true },
    { title: 'Ngày', dataIndex: 'createdAt', render: (d) => new Date(d).toLocaleDateString('vi-VN') },
    { title: '', width: 60, render: (_, r) => (
      <Popconfirm title="Xóa đánh giá?" onConfirm={() => handleDelete(r._id)}><Button icon={<DeleteOutlined />} size="small" danger /></Popconfirm>
    )},
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý đánh giá</h1>
        <Select placeholder="Lọc theo sao" allowClear style={{ width: 160 }} onChange={(v) => { setRatingFilter(v || ''); setPage(1) }}
          options={[5, 4, 3, 2, 1].map((r) => ({ label: `${r} sao`, value: r }))} />
      </div>
      <Table columns={columns} dataSource={reviews} rowKey="_id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: setPage }} size="small" />
    </div>
  )
}
