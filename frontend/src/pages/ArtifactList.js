import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Card,
  Tag,
  Pagination,
  Modal,
  message,
  Row,
  Col,
} from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom"; // 添加 useLocation
import { artifactService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
// 引入ArtifactForm组件
import ArtifactForm from '../components/ArtifactForm'; 

const { Search } = Input;
const { Option } = Select;

const ArtifactList = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 获取location
  const { user, canEditArtifacts } = useAuth();
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");
  const [era, setEra] = useState("");
  const [valueLevel, setValueLevel] = useState(""); // 新增：价值等级状态
  const [preservationStatus, setPreservationStatus] = useState(""); // 新增：保存状况
  const [availableMin, setAvailableMin] = useState(""); // 新增：最小可展示数量
  const [availableAmount, setAvailableAmount] = useState(""); // 新增：特定可展示数量
  const [categories, setCategories] = useState([]);
  const [eras, setEras] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  // 保持modalVisible状态用于控制弹窗显示/隐藏
  const [modalVisible, setModalVisible] = useState(false);
  // 保存选中的文物（编辑时使用）
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  // 解析URL查询参数
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // 获取所有可能的查询参数
    const searchParam = params.get('search') || '';
    const categoryParam = params.get('category') || '';
    const eraParam = params.get('era') || '';
    const valueLevelParam = params.get('value_level') || '';
    const preservationStatusParam = params.get('preservation_status') || '';
    const availableMinParam = params.get('available_min') || '';
    const availableAmountParam = params.get('available_amount') || '';
    
    // 更新状态
    setSearchText(searchParam);
    setCategory(categoryParam);
    setEra(eraParam);
    setValueLevel(valueLevelParam);
    setPreservationStatus(preservationStatusParam);
    setAvailableMin(availableMinParam);
    setAvailableAmount(availableAmountParam);
    
    // 使用URL参数获取文物列表
    fetchArtifacts(1, 
      searchParam, 
      categoryParam, 
      eraParam,
      valueLevelParam,
      preservationStatusParam,
      availableMinParam,
      availableAmountParam
    );
    
    // 获取分类和年代列表
    fetchCategories();
    fetchEras();
  }, [location.search]); // 当URL变化时重新运行

  const fetchArtifacts = async (
    page = 1,
    search = searchText,
    cat = category,
    eraFilter = era,
    valueLevelFilter = valueLevel,
    preservationStatusFilter = preservationStatus,
    availableMinFilter = availableMin,
    availableAmountFilter = availableAmount
  ) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.pageSize,
        search,
        category: cat,
        era: eraFilter,
        value_level: valueLevelFilter,
        preservation_status: preservationStatusFilter,
        available_min: availableMinFilter,
        available_amount: availableAmountFilter
      };

      const response = await artifactService.getAllArtifacts(params);
      setArtifacts(response.data.artifacts);
      setPagination({
        ...pagination,
        current: response.data.page,
        total: response.data.total,
      });
    } catch (error) {
      message.error("获取文物列表失败");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await artifactService.getCategories();
      setCategories(response.data);
    } catch (error) {
      message.error("获取分类失败");
    }
  };

  const fetchEras = async () => {
    try {
      const response = await artifactService.getEras();
      setEras(response.data);
    } catch (error) {
      message.error("获取年代失败");
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    // 更新URL但不重新加载页面
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    navigate({ search: params.toString() });
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    navigate({ search: params.toString() });
  };

  const handleEraChange = (value) => {
    setEra(value);
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set('era', value);
    } else {
      params.delete('era');
    }
    navigate({ search: params.toString() });
  };

  // 新增：价值等级筛选
  const handleValueLevelChange = (value) => {
    setValueLevel(value);
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set('value_level', value);
    } else {
      params.delete('value_level');
    }
    navigate({ search: params.toString() });
  };

  // 新增：保存状况筛选
  const handlePreservationStatusChange = (value) => {
    setPreservationStatus(value);
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set('preservation_status', value);
    } else {
      params.delete('preservation_status');
    }
    navigate({ search: params.toString() });
  };

  const handlePageChange = (page, pageSize) => {
    setPagination({ ...pagination, current: page, pageSize });
    fetchArtifacts(page, searchText, category, era, valueLevel, preservationStatus, availableMin, availableAmount);
  };

  const handleViewArtifact = (id) => {
    navigate(`/artifacts/${id}`);
  };

  // 保持handleAddArtifact函数不变，用于打开添加弹窗
  const handleAddArtifact = () => {
    setSelectedArtifact(null); // 清空选中的文物，确保是添加模式
    setModalVisible(true);     // 显示弹窗
  };

  const handleEditArtifact = (artifact) => {
    // 如果你也想把编辑改成弹窗形式，可以修改这里：
    // setSelectedArtifact(artifact);
    // setModalVisible(true);
    // 暂时保留原有跳转逻辑
    navigate(`/artifacts/edit/${artifact.id}`);
  };

  const handleDeleteArtifact = async (id) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这件文物吗？此操作不可恢复。",
      okText: "确认",
      cancelText: "取消",
      onOk: async () => {
        try {
          await artifactService.deleteArtifact(id);
          message.success("删除成功");
          fetchArtifacts(pagination.current, searchText, category, era, valueLevel, preservationStatus, availableMin, availableAmount);
        } catch (error) {
          message.error("删除失败");
        }
      },
    });
  };

  const columns = [
    {
      title: "文物编号",
      dataIndex: "artifact_code",
      key: "artifact_code",
      width: 120,
      render: (text) => (
        <Tag color="blue" style={{ fontFamily: "monospace" }}>
          {text}
        </Tag>
      ),
    },
    {
      title: "文物名称",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Button
            type="link"
            onClick={() => handleViewArtifact(record.id)}
            style={{
              textAlign: "left",
              padding: 0,
              height: "auto",
              fontWeight: "bold",
            }}
          >
            {text}
          </Button>
          <small style={{ color: "#666" }}>
            {record.era} • {record.category}
          </small>
        </Space>
      ),
    },
    {
      title: "年代",
      dataIndex: "era",
      key: "era",
      width: 100,
    },
    {
      title: "类别",
      dataIndex: "category",
      key: "category",
      width: 100,
      render: (category) => <Tag color="blue">{category || "未分类"}</Tag>,
    },
    {
      title: "价值等级",
      dataIndex: "value_level",
      key: "value_level",
      width: 100,
      render: (level) => {
        const colors = {
          一级: "red",
          二级: "orange",
          三级: "green",
          一般: "blue",
        };
        return <Tag color={colors[level] || "default"}>{level}</Tag>;
      },
    },
    {
      title: "保存状况",
      dataIndex: "preservation_status",
      key: "preservation_status",
      width: 110,
      render: (status) => {
        const colors = {
          完好: "success",
          轻度损坏: "warning",
          中度损坏: "orange",
          严重损坏: "error",
          修复中: "processing",
        };
        return <Tag color={colors[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "库存",
      dataIndex: "available_amount",
      key: "available_amount",
      width: 100,
      render: (available, record) => (
        <Tag color={available > 0 ? "success" : "error"}>
          {available}/{record.total_amount}
        </Tag>
      ),
    },
  ];

  // 如果是管理员或策展人，添加操作列
  if (canEditArtifacts()) {
    columns.push({
      title: "操作",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleViewArtifact(record.id)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleEditArtifact(record)}
          >
            编辑
          </Button>
          {user?.role === "admin" && (
            <Button
              type="link"
              danger
              size="small"
              onClick={() => handleDeleteArtifact(record.id)}
            >
              删除
            </Button>
          )}
        </Space>
      ),
    });
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <span>文物管理</span>
            <Tag color="blue">{pagination.total} 件文物</Tag>
          </Space>
        }
        extra={
          canEditArtifacts() && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddArtifact}
            >
              添加文物
            </Button>
          )
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索文物名称、编号或描述"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              size="large"
              defaultValue={searchText}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="选择类别"
              allowClear
              style={{ width: "100%" }}
              size="large"
              onChange={handleCategoryChange}
              value={category || undefined}
            >
              <Option value="">所有类别</Option>
              {categories.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="选择年代"
              allowClear
              style={{ width: "100%" }}
              size="large"
              onChange={handleEraChange}
              value={era || undefined}
            >
              <Option value="">所有年代</Option>
              {eras.map((eraItem) => (
                <Option key={eraItem} value={eraItem}>
                  {eraItem}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="价值等级"
              allowClear
              style={{ width: "100%" }}
              size="large"
              onChange={handleValueLevelChange}
              value={valueLevel || undefined}
            >
              <Option value="">所有等级</Option>
              <Option value="一级">一级文物</Option>
              <Option value="二级">二级文物</Option>
              <Option value="三级">三级文物</Option>
              <Option value="一般">一般文物</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="保存状况"
              allowClear
              style={{ width: "100%" }}
              size="large"
              onChange={handlePreservationStatusChange}
              value={preservationStatus || undefined}
            >
              <Option value="">所有状态</Option>
              <Option value="完好">完好</Option>
              <Option value="轻度损坏">轻度损坏</Option>
              <Option value="中度损坏">中度损坏</Option>
              <Option value="严重损坏">严重损坏</Option>
              <Option value="修复中">修复中</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={artifacts}
          rowKey="id"
          loading={loading}
          pagination={false}
          onRow={(record) => ({
            onClick: () => handleViewArtifact(record.id),
            style: { cursor: "pointer" },
          })}
        />

        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }
          style={{ marginTop: 24, textAlign: "right" }}
        />
      </Card>

      {canEditArtifacts() && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ color: "#999" }}>
            提示：只有管理员和策展人可以添加和编辑文物，只有管理员可以删除文物。
          </p>
        </div>
      )}

      {/* 保持Modal组件原样，放在return的最后 */}
      <Modal
        title={selectedArtifact ? '编辑文物' : '添加文物'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <ArtifactForm
          artifact={selectedArtifact}
          onSubmit={() => {
            setModalVisible(false);
            fetchArtifacts(pagination.current, searchText, category, era, valueLevel, preservationStatus, availableMin, availableAmount);
          }}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default ArtifactList;