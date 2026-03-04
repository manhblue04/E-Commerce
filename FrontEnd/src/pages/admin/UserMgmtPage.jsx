import { useState, useEffect } from 'react'
import { Table, Button, Tag, Select, Input, Popconfirm, message } from 'antd'
import { LockOutlined, UnlockOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons'
import * as adminApi from '../../services/adminService'

export default function UserMgmtPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const fetchUsers = (p = 1) => {
    setLoading(true)
    const params = { page: p, limit: 20 }
    if (keyword) params.keyword = keyword
    adminApi.getUsers(params).then((r) => { setUsers(r.users); setTotal(r.total) }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers(page) }, [page, keyword])

  const handleSearch = () => { setKeyword(searchVal); setPage(1) }

  const handleToggleBlock = async (id) => {
    const res = await adminApi.toggleBlockUser(id)
    message.success(res.message)
    fetchUsers(page)
  }

  const handleRoleChange = async (id, role) => {
    await adminApi.updateUserRole(id, { role })
    message.success('Cập nhật quyền thành công')
    fetchUsers(page)
  }

  const columns = [
    { title: 'Tên', dataIndex: 'name', render: (v) => v || '-' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'SĐT', dataIndex: 'phone', render: (v) => v || '-' },
    { title: 'Quyền', dataIndex: 'role', render: (role, r) => (
      <Select value={role} size="small" style={{ width: 100 }} onChange={(v) => handleRoleChange(r._id, v)}
        options={[{ label: 'User', value: 'user' }, { label: 'Admin', value: 'admin' }]} />
    )},
    { title: 'Xác thực', dataIndex: 'isVerified', render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Đã xác thực' : 'Chưa'}</Tag> },
    { title: 'Trạng thái', dataIndex: 'isBlocked', render: (v) => <Tag color={v ? 'red' : 'green'}>{v ? 'Bị khóa' : 'Hoạt động'}</Tag> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', render: (d) => new Date(d).toLocaleDateString('vi-VN') },
    { title: '', width: 80, render: (_, r) => (
      <Popconfirm title={r.isBlocked ? 'Mở khóa tài khoản?' : 'Khóa tài khoản?'} onConfirm={() => handleToggleBlock(r._id)}>
        <Button icon={r.isBlocked ? <UnlockOutlined /> : <LockOutlined />} size="small" danger={!r.isBlocked} />
      </Popconfirm>
    )},
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý người dùng</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input.Search
            placeholder="Tìm theo tên, email..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
            allowClear
            onClear={() => { setSearchVal(''); setKeyword(''); setPage(1) }}
          />
          <Button icon={<DownloadOutlined />} onClick={() => adminApi.exportCsv('users')}>Export</Button>
        </div>
      </div>
      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 12, padding: '8px 16px', background: '#fff7ed', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13 }}>Đã chọn {selectedRowKeys.length} người dùng</span>
          <Button size="small" danger onClick={async () => {
            await adminApi.bulkBlockUsers(selectedRowKeys, true)
            message.success(`Đã khóa ${selectedRowKeys.length} tài khoản`)
            setSelectedRowKeys([])
            fetchUsers(page)
          }}>Khóa hàng loạt</Button>
          <Button size="small" onClick={async () => {
            await adminApi.bulkBlockUsers(selectedRowKeys, false)
            message.success(`Đã mở khóa ${selectedRowKeys.length} tài khoản`)
            setSelectedRowKeys([])
            fetchUsers(page)
          }}>Mở khóa hàng loạt</Button>
          <Button size="small" onClick={() => setSelectedRowKeys([])}>Bỏ chọn</Button>
        </div>
      )}

      <Table columns={columns} dataSource={users} rowKey="_id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: setPage }} size="small" scroll={{ x: 800 }}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }} />
    </div>
  )
}
