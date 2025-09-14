// 地址信息读取模块
const AddressReader = {
    async loadFriendsData() {
        try {
            console.log('开始加载 friends_data.json 文件...');
            const response = await fetch('friends_data.json');
            // 检查响应状态是否成功
            console.log('friends_data.json 响应状态:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('加载的朋友数据:', data); // 添加日志以便调试
            console.log('加载到的朋友数量:', data.length);
            return data;
        } catch (error) {
            console.error('加载朋友数据失败:', error);
            console.warn('请检查 friends_data.json 文件是否存在，以及路径是否正确');
            return [];
        }
    },
    
    // 加载中国地图数据（ECharts 5需要单独加载地图数据）
    async loadChinaMapData() {
        try {
            // 使用CDN上的中国地图数据
            const response = await fetch('https://cdn.jsdelivr.net/npm/echarts/map/json/china.json');
            const mapData = await response.json();
            return mapData;
        } catch (error) {
            console.error('加载中国地图数据失败:', error);
            throw error;
        }
    }
};

// 地图展示模块
const MapRenderer = {
    mapInstance: null,
    
    async initMap(containerId) {
        try {
            // 初始化地图实例
            this.mapInstance = echarts.init(document.getElementById(containerId));
            
            // 注册中国地图数据
            const chinaMapData = await AddressReader.loadChinaMapData();
            echarts.registerMap('china', chinaMapData);
            
            // 设置默认选项
            this.setMapOption([]);
            
            // 添加动画效果
            this.addAnimation();
            
            // 响应式调整
            window.addEventListener('resize', () => {
                this.mapInstance.resize();
            });
        } catch (error) {
            console.error('地图初始化失败:', error);
        }
    },
    
    updateMapWithData(friendsData) {
        const points = this.preparePointsData(friendsData);
        
        // 添加测试数据点，确保至少有一个点显示在地图上
        const testPoints = [
            { name: '测试点1', value: [116.4074, 39.9042], city: '北京', type: '测试点' },
            { name: '测试点2', value: [121.4737, 31.2304], city: '上海', type: '测试点' }
        ];
        
        // 合并原始数据点和测试数据点
        const allPoints = [...points, ...testPoints];
        
        console.log('准备的地图数据点总数:', allPoints.length);
        console.log('原始数据点数量:', points.length);
        console.log('测试数据点数量:', testPoints.length);
        
        this.setMapOption(allPoints);
    },
    
    preparePointsData(friendsData) {
        const points = [];
        console.log('开始处理朋友数据，总共有', friendsData.length, '条记录');
        
        friendsData.forEach(friend => {
            console.log(`处理朋友: ${friend.Name}, city1: ${friend.city1}, city2: ${friend.city2}`);
            
            // 处理第一个位置
            if (friend.Location1) {
                try {
                    console.log(`  Location1原始数据: ${friend.Location1}`);
                    const locationParts = friend.Location1.split(',').map(Number);
                    
                    // 检查数据格式是否正确
                    if (locationParts.length !== 2 || isNaN(locationParts[0]) || isNaN(locationParts[1])) {
                        console.warn(`  ${friend.Name}的Location1格式不正确: ${friend.Location1}`);
                        return;
                    }
                    
                    // 注意：有些数据可能是[经度, 纬度]格式，有些是[纬度, 经度]格式
                    // 为了兼容性，我们需要检查哪个在合理范围内
                    let lng, lat;
                    if (locationParts[0] >= -180 && locationParts[0] <= 180 && 
                        locationParts[1] >= -90 && locationParts[1] <= 90) {
                        // 假设格式是[经度, 纬度]
                        lng = locationParts[0];
                        lat = locationParts[1];
                    } else if (locationParts[1] >= -180 && locationParts[1] <= 180 && 
                               locationParts[0] >= -90 && locationParts[0] <= 90) {
                        // 假设格式是[纬度, 经度]
                        lng = locationParts[1];
                        lat = locationParts[0];
                    } else {
                        console.warn(`  ${friend.Name}的Location1坐标值不合理: ${friend.Location1}`);
                        return;
                    }
                    
                    console.log(`  解析后的坐标: lng=${lng}, lat=${lat}`);
                    points.push({
                        name: friend.Name,
                        value: [lng, lat],
                        city: friend.city1,
                        type: '主要城市'
                    });
                } catch (error) {
                    console.error(`解析${friend.Name}的Location1失败:`, error);
                }
            } else {
                console.log(`  ${friend.Name}没有Location1数据`);
            }
            
            // 处理第二个位置
            if (friend.Location2) {
                try {
                    console.log(`  Location2原始数据: ${friend.Location2}`);
                    const locationParts = friend.Location2.split(',').map(Number);
                    
                    // 检查数据格式是否正确
                    if (locationParts.length !== 2 || isNaN(locationParts[0]) || isNaN(locationParts[1])) {
                        console.warn(`  ${friend.Name}的Location2格式不正确: ${friend.Location2}`);
                        return;
                    }
                    
                    // 同样检查坐标范围以确定经纬度顺序
                    let lng, lat;
                    if (locationParts[0] >= -180 && locationParts[0] <= 180 && 
                        locationParts[1] >= -90 && locationParts[1] <= 90) {
                        lng = locationParts[0];
                        lat = locationParts[1];
                    } else if (locationParts[1] >= -180 && locationParts[1] <= 180 && 
                               locationParts[0] >= -90 && locationParts[0] <= 90) {
                        lng = locationParts[1];
                        lat = locationParts[0];
                    } else {
                        console.warn(`  ${friend.Name}的Location2坐标值不合理: ${friend.Location2}`);
                        return;
                    }
                    
                    console.log(`  解析后的坐标: lng=${lng}, lat=${lat}`);
                    points.push({
                        name: friend.Name,
                        value: [lng, lat],
                        city: friend.city2,
                        type: '次要城市'
                    });
                } catch (error) {
                    console.error(`解析${friend.Name}的Location2失败:`, error);
                }
            } else {
                console.log(`  ${friend.Name}没有Location2数据`);
            }
        });
        
        console.log('处理完成，成功生成', points.length, '个数据点');
        return points;
    },
    
    setMapOption(points) {
        // 简化版地图配置，专注于数据点显示
        const option = {
            backgroundColor: 'transparent',
            
            title: {
                text: '约饭地图',
                left: 20,
                top: 20,
                textStyle: {
                    color: '#38bdf8',
                    fontSize: 16
                }
            },
            
            tooltip: {
                trigger: 'item',
                formatter: (params) => {
                    if (params.dataType === 'series') {
                        return `姓名: ${params.data.name}<br/>城市: ${params.data.city}<br/>类型: ${params.data.type}`;
                    }
                    return params.name;
                }
            },
            
            // 简化的地图配置
            geo: {
                map: 'china',
                roam: true,
                center: [104.195, 35.861],
                zoom: 3.5,
                label: {
                    show: true
                },
                itemStyle: {
                    areaColor: '#1e3a8a',
                    borderColor: '#38bdf8'
                }
            },
            
            series: [
                // 只保留一个简单的数据点系列
                {
                    name: '朋友位置',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: points,
                    symbolSize: 20,
                    symbol: 'circle',
                    itemStyle: {
                        color: '#ff6b6b',
                        shadowBlur: 10
                    }
                }
            ]
        };
        
        this.mapInstance.setOption(option);
    },
    
    // 添加地图动画效果
    addAnimation() {
        // 使用ECharts正确的动画方式，通过设置动画配置
        this.mapInstance.setOption({
            animation: true,
            animationDuration: 2000,
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
                return idx * 100;
            }
        });
    }
};

// 主程序
async function init() {
    try {
        // 初始化地图（现在是异步的）
        await MapRenderer.initMap('mapContainer');
        
        // 加载朋友数据
        const friendsData = await AddressReader.loadFriendsData();
        
        // 更新地图展示
        if (friendsData.length > 0) {
            MapRenderer.updateMapWithData(friendsData);
        } else {
            console.warn('没有加载到朋友数据');
        }
    } catch (error) {
        console.error('初始化失败:', error);
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);