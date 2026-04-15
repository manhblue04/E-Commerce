import { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Switch, Button, Card, Select, message, Spin, Tag } from 'antd'
import { RobotOutlined, KeyOutlined } from '@ant-design/icons'
import * as adminApi from '../../services/adminService'

const MODELS = {
  gemini: [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  ],
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
}

export default function SettingPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [provider, setProvider] = useState('gemini')
  const [originalApiKey, setOriginalApiKey] = useState('')

  useEffect(() => {
    adminApi.getSettings().then((r) => {
      const s = r.settings
      form.setFieldsValue(s)
      setProvider(s?.ai?.provider || 'gemini')
      setOriginalApiKey(s?.ai?.apiKey || '')
    }).finally(() => setLoading(false))
  }, [])

  const handleProviderChange = (val) => {
    setProvider(val)
    form.setFieldValue(['ai', 'model'], MODELS[val][0].value)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const values = await form.validateFields()
      // Nếu API key để trống → giữ nguyên key cũ
      if (!values.ai?.apiKey?.trim()) {
        if (values.ai) values.ai.apiKey = ''
      }
      await adminApi.updateSettings(values)
      message.success('Lưu cài đặt thành công')
    } catch { /* empty */ } finally { setSaving(false) }
  }

  if (loading) return <Spin size="large" className="flex justify-center py-20" />

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Cài đặt cửa hàng</h1>
      <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
        <Card title="Thông tin chung" style={{ marginBottom: 16 }}>
          <Form.Item name="storeName" label="Tên cửa hàng"><Input /></Form.Item>
          <Form.Item name="tagline" label="Slogan"><Input /></Form.Item>
          <Form.Item name="contactEmail" label="Email liên hệ"><Input /></Form.Item>
          <Form.Item name="contactPhone" label="SĐT liên hệ"><Input /></Form.Item>
          <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
        </Card>

        <Card title="Vận chuyển & Thuế" style={{ marginBottom: 16 }}>
          <Form.Item name={['shipping', 'fee']} label="Phí vận chuyển (₫)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name={['shipping', 'freeShippingThreshold']} label="Miễn phí ship từ (₫)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name={['tax', 'enabled']} label="Bật thuế" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name={['tax', 'percent']} label="Thuế (%)"><InputNumber style={{ width: '100%' }} min={0} max={100} /></Form.Item>
        </Card>

        <Card title="Phương thức thanh toán" style={{ marginBottom: 16 }}>
          <Form.Item name={['paymentMethods', 'cod']} label="COD" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name={['paymentMethods', 'momo']} label="MoMo" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name={['paymentMethods', 'vnpay']} label="VNPay" valuePropName="checked"><Switch /></Form.Item>
        </Card>

        <Card
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RobotOutlined /> Cài đặt AI Chat
            </span>
          }
          style={{ marginBottom: 16 }}
          extra={<Tag color="blue">Tự động trả lời</Tag>}
        >
          <Form.Item name={['ai', 'autoReply']} label="Bật tự động trả lời" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name={['ai', 'provider']} label="Nhà cung cấp AI">
            <Select onChange={handleProviderChange} options={[
              { value: 'gemini', label: 'Google Gemini' },
              { value: 'openai', label: 'OpenAI (ChatGPT)' },
            ]} />
          </Form.Item>

          <Form.Item name={['ai', 'model']} label="Model">
            <Select options={MODELS[provider]} />
          </Form.Item>

          <Form.Item
            name={['ai', 'apiKey']}
            label={
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <KeyOutlined /> API Key
                {originalApiKey && <Tag color="green" style={{ marginLeft: 4 }}>Đã cấu hình</Tag>}
              </span>
            }
            extra="Để trống nếu không muốn thay đổi key hiện tại"
          >
            <Input.Password placeholder={originalApiKey ? '••••••••••••  (giữ nguyên key cũ)' : 'Nhập API key mới'} />
          </Form.Item>
        </Card>

        <Button type="primary" size="large" onClick={handleSave} loading={saving}>Lưu cài đặt</Button>
      </Form>
    </div>
  )
}
