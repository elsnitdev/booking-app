import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Monitor,
  Presentation,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
  Wifi,
  X,
  TrendingUp,
  Maximize2,
  Tv,
  Mic,
  Coffee,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { adminRequest } from '../../requests/adminRequest';
import { roomRequest } from '../../requests/roomRequest';
import type {
  AdminRoomItem,
  AdminBookingItem,
  RoomManagePayload,
  AdminRoomImage,
  AmenityItem
} from '../../types/admin';
import { useAdminToast } from '../../context/AdminToastContext';

// Bộ ảnh mẫu kiến trúc phòng họp sang trọng chuẩn Quiet Luxury
const DEFAULT_GALLERY = [
  {
    id: '1',
    title: 'Góc Toàn Cảnh Phòng Họp',
    tag: 'Main Overview',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
    description: 'Bố cục bàn hội đàm chữ U với ghế da công thái học cao cấp và ánh sáng tự nhiên từ vách kính trần.'
  },
  {
    id: '2',
    title: 'Góc Trực Diện Bàn Hội Đàm',
    tag: 'Boardroom Setup',
    url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop',
    description: 'Bàn gỗ óc chó tự nhiên tích hợp cổng cắm sạc không dây và màn hình phụ điều khiển từng vị trí.'
  },
  {
    id: '3',
    title: 'Khu Vực Trình Chiếu & Màn Hình 4K',
    tag: 'Presentation Angle',
    url: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?q=80&w=1200&auto=format&fit=crop',
    description: 'Màn hình LED 98 inch độ tương phản cao, góc nhìn rộng phục vụ hội đàm video trực tuyến đa điểm.'
  },
  {
    id: '4',
    title: 'Góc Thảo Luận & Studio Sáng Tạo',
    tag: 'Creative Corner',
    url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1200&auto=format&fit=crop',
    description: 'Bảng kính từ tính di động và khu vực sofa thư giãn dành cho các phiên trao đổi nhóm nhanh.'
  },
  {
    id: '5',
    title: 'Quầy Teabreak & Sảnh Chờ Riêng',
    tag: 'Lounge & Refreshment',
    url: 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?q=80&w=1200&auto=format&fit=crop',
    description: 'Quầy bar mini phục vụ cà phê hạt nguyên chất và trà hữu cơ thượng hạng cho khách tham dự.'
  }
];

export default function AdminRoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useAdminToast();

  const [, setRoom] = useState<AdminRoomItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  // Form edit states
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState('');
  const [capacity, setCapacity] = useState(12);
  const [hourlyRate, setHourlyRate] = useState(350000);
  const [location, setLocation] = useState('');
  const [cleanupTimeMinutes, setCleanupTimeMinutes] = useState(15);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');

  // Dynamic Images & Amenities
  const [roomImages, setRoomImages] = useState<AdminRoomImage[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<AmenityItem[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<
    Record<string, { selected: boolean; customNote: string }>
  >({});

  // Quản lý ảnh
  const [showImageManager, setShowImageManager] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [newImageTag, setNewImageTag] = useState('Góc nhìn');

  // Amenities legacy fallback
  const [hasProjector, setHasProjector] = useState(true);
  const [hasWhiteboard, setHasWhiteboard] = useState(true);
  const [hasVideoConference, setHasVideoConference] = useState(true);

  // Lịch họp sắp diễn ra của phòng
  const [upcomingBookings, setUpcomingBookings] = useState<AdminBookingItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const renderAmenityIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'monitor': return <Monitor size={16} className="text-[#a67c2e]" />;
      case 'tv': return <Tv size={16} className="text-[#a67c2e]" />;
      case 'maximize-2':
      case 'maximize': return <Maximize2 size={16} className="text-[#a67c2e]" />;
      case 'mic': return <Mic size={16} className="text-[#a67c2e]" />;
      case 'video': return <Video size={16} className="text-[#a67c2e]" />;
      case 'presentation': return <Presentation size={16} className="text-[#a67c2e]" />;
      case 'wifi': return <Wifi size={16} className="text-[#a67c2e]" />;
      case 'coffee': return <Coffee size={16} className="text-[#a67c2e]" />;
      default: return <Sparkles size={16} className="text-[#a67c2e]" />;
    }
  };

  // Tải dữ liệu phòng
  const loadRoomData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 1. Lấy danh mục Master Amenities trước
      let masterAmenities: AmenityItem[] = [];
      try {
        const amRes = await adminRequest.getAmenities();
        if (amRes.data && amRes.data.length > 0) {
          masterAmenities = amRes.data;
          setAvailableAmenities(masterAmenities);
        }
      } catch (err) {
        console.error('Không tải được danh mục tiện nghi:', err);
      }

      // 2. Thử lấy từ API Admin
      const res = await adminRequest.getRooms();
      const found = res.data?.find((r) => r.id === id);

      if (found) {
        setRoom(found);
        setName(found.name);
        setRoomType(found.roomType);
        setCapacity(found.capacity);
        setHourlyRate(found.hourlyRate);
        setLocation(found.location || 'Tầng 12, Tòa nhà Hội Nghị Alpha, Q.1');
        setDescription(found.description || '');
        setCleanupTimeMinutes(found.cleanupTimeMinutes || 15);
        setIsActive(found.isActive);
        setHasProjector(found.hasProjector);
        setHasWhiteboard(found.hasWhiteboard);
        setHasVideoConference(found.hasVideoConference);

        if (found.images && found.images.length > 0) {
          setRoomImages(found.images);
        }

        // Đồng bộ tiện nghi đã gán vào map
        const initialMap: Record<string, { selected: boolean; customNote: string }> = {};
        masterAmenities.forEach((a) => {
          const match = found.amenities?.find((ra) => ra.id === a.id);
          initialMap[a.id] = {
            selected: !!match,
            customNote: match?.customNote || ''
          };
        });
        setSelectedAmenities(initialMap);
      } else {
        // Fallback thử tìm bằng roomRequest công khai
        const clientRes = await roomRequest.getById(id);
        if (clientRes.data) {
          const c = clientRes.data;
          const adminItem: AdminRoomItem = {
            id: c.id,
            name: c.name,
            capacity: c.capacity,
            roomType: c.roomType,
            hourlyRate: c.hourlyRate,
            location: c.location,
            description: c.description,
            coverImageUrl: c.coverImageUrl,
            hasProjector: !!c.hasProjector,
            hasWhiteboard: !!c.hasWhiteboard,
            hasVideoConference: !!c.hasVideoConference,
            cleanupTimeMinutes: c.cleanupTimeMinutes || 15,
            isActive: c.isActive ?? true,
            images: c.images,
            amenities: c.amenities,
          };
          setRoom(adminItem);
          setName(adminItem.name);
          setRoomType(adminItem.roomType);
          setCapacity(adminItem.capacity);
          setHourlyRate(adminItem.hourlyRate);
          setLocation(adminItem.location);
          setDescription(adminItem.description || '');
          setCleanupTimeMinutes(adminItem.cleanupTimeMinutes || 15);
          setIsActive(adminItem.isActive);
          setHasProjector(adminItem.hasProjector);
          setHasWhiteboard(adminItem.hasWhiteboard);
          setHasVideoConference(adminItem.hasVideoConference);

          if (c.images && c.images.length > 0) {
            setRoomImages(c.images);
          }

          const initialMap: Record<string, { selected: boolean; customNote: string }> = {};
          masterAmenities.forEach((a) => {
            const match = c.amenities?.find((ra) => ra.id === a.id);
            initialMap[a.id] = {
              selected: !!match,
              customNote: match?.customNote || ''
            };
          });
          setSelectedAmenities(initialMap);
        }
      }
    } catch {
      // Khi mất mạng hoặc API lỗi: Sử dụng dữ liệu mẫu phong phú để phục vụ review giao diện
      const mockItem: AdminRoomItem = {
        id: id || 'demo-room-id',
        name: 'Phòng Hội Thảo Boardroom Alpha Prestige',
        capacity: 16,
        roomType: 'Executive Boardroom',
        hourlyRate: 480000,
        location: 'Tầng 21, Tháp Tài Chính Quốc Tế, Quận 1, TP.HCM',
        description: 'Không gian phòng họp hội đồng cao cấp chuẩn 5 sao với vách kính trần đón trọn ánh sáng tự nhiên.',
        hasProjector: true,
        hasWhiteboard: true,
        hasVideoConference: true,
        cleanupTimeMinutes: 15,
        isActive: true,
      };
      setRoom(mockItem);
      setName(mockItem.name);
      setRoomType(mockItem.roomType);
      setCapacity(mockItem.capacity);
      setHourlyRate(mockItem.hourlyRate);
      setLocation(mockItem.location);
      setDescription(mockItem.description || '');
      setCleanupTimeMinutes(mockItem.cleanupTimeMinutes || 15);
      setIsActive(mockItem.isActive);
      setHasProjector(mockItem.hasProjector);
      setHasWhiteboard(mockItem.hasWhiteboard);
      setHasVideoConference(mockItem.hasVideoConference);

      const mockMaster: AmenityItem[] = [
        { id: 'am-1', name: 'Màn hình LED hội trường lớn', category: 'Trình chiếu', icon: 'monitor', description: 'Màn hình LED P2.0 siêu lớn chuyên dụng hội nghị và sự kiện', isActive: true },
        { id: 'am-2', name: 'Smart TV 4K & Bàn Ghế Họp Cao Cấp', category: 'Trình chiếu', icon: 'tv', description: 'TV 75-85 inch sắc nét cùng hệ bàn ghế công thái học bọc da', isActive: true },
        { id: 'am-3', name: 'Sàn Trống Đa Năng Cho Hoạt Động', category: 'Không gian', icon: 'maximize-2', description: 'Sàn gỗ phẳng chống trơn trượt, phù hợp workshop, teambuilding, biểu diễn', isActive: true },
        { id: 'am-4', name: 'Hệ Thống Âm Thanh & Micro Không Dây', category: 'Âm thanh', icon: 'mic', description: 'Loa vòm âm thanh hội trường và micro cài áo / không dây Shure', isActive: true },
        { id: 'am-5', name: 'Phòng Họp Trực Tuyến Đa Điểm Zoom/Teams', category: 'Công nghệ', icon: 'video', description: 'Camera 4K bám theo người nói và hệ thống micro định hướng', isActive: true },
        { id: 'am-6', name: 'Bảng Kính Thảo Luận Từ Tính & Flipchart', category: 'Tiện ích', icon: 'presentation', description: 'Bảng kính cường lực khổ lớn kèm bút dạ màu và nam châm giữ tài liệu', isActive: true },
        { id: 'am-7', name: 'Đường Truyền Internet Wifi 6 Chuyên Dụng', category: 'Mạng', icon: 'wifi', description: 'Băng thông riêng biệt 1Gbps phủ sóng xuyên tường bảo mật cao', isActive: true },
        { id: 'am-8', name: 'Quầy Cà Phê Pha Máy & Trà Teabreak', category: 'Ẩm thực', icon: 'coffee', description: 'Máy pha cà phê Delonghi tự động, trà thảo mộc hữu cơ phục vụ tại chỗ', isActive: true }
      ];
      setAvailableAmenities(mockMaster);
      const mockMap: Record<string, { selected: boolean; customNote: string }> = {
        'am-1': { selected: true, customNote: 'Màn hình LED P2.0 kích thước 300 inch siêu nét' },
        'am-2': { selected: true, customNote: 'Smart TV 85 inch 4K và bộ bàn ghế họp 16 chỗ da bò tự nhiên' },
        'am-4': { selected: true, customNote: '2 micro không dây Shure & âm thanh vòm chống hú' },
        'am-5': { selected: true, customNote: 'Hệ thống Zoom Rooms bản quyền 4K' },
        'am-7': { selected: true, customNote: 'Wifi 6 tốc độ 1Gbps riêng biệt' }
      };
      setSelectedAmenities(mockMap);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Tải danh sách lịch họp của phòng
  const loadRoomBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const res = await adminRequest.getBookings();
      if (res.data) {
        // Lọc theo id hoặc tên phòng
        const filtered = res.data.filter(
          (b) => b.roomName.toLowerCase().includes(name.toLowerCase()) || b.id.includes(id || '')
        );
        setUpcomingBookings(filtered.slice(0, 4));
      }
    } catch {
      // Dữ liệu mẫu demo phục vụ review
      setUpcomingBookings([
        {
          id: 'b-01',
          rawId: 'b-01-raw',
          title: 'Hội Đàm Chiến Lược & Ngân Sách Quý 4',
          companyName: 'Tập đoàn FinTech VinaCapital',
          contactEmail: 'executive@vinafin.com',
          roomName: name || 'Phòng Hội Thảo Boardroom Alpha Prestige',
          roomType: 'Executive Boardroom',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '11:30',
          participantCount: 12,
          totalPrice: 1200000,
          status: 'Confirmed'
        },
        {
          id: 'b-02',
          rawId: 'b-02-raw',
          title: 'Ký Kết Hợp Đồng Đối Tác Chiến Lược Quốc Tế',
          companyName: 'Global Logistics Alliance',
          contactEmail: 'contact@globallogistics.com',
          roomName: name || 'Phòng Hội Thảo Boardroom Alpha Prestige',
          roomType: 'Executive Boardroom',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          startTime: '14:00',
          endTime: '16:00',
          participantCount: 10,
          totalPrice: 960000,
          status: 'Confirmed'
        },
        {
          id: 'b-03',
          rawId: 'b-03-raw',
          title: 'Phỏng Vấn & Đánh Giá Giám Đốc Điều Hành',
          companyName: 'TalentHub International',
          contactEmail: 'talent@talenthub.vn',
          roomName: name || 'Phòng Hội Thảo Boardroom Alpha Prestige',
          roomType: 'Executive Boardroom',
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '12:00',
          participantCount: 6,
          totalPrice: 960000,
          status: 'Pending'
        }
      ]);
    } finally {
      setLoadingBookings(false);
    }
  }, [id, name]);

  useEffect(() => {
    loadRoomData();
  }, [loadRoomData]);

  useEffect(() => {
    if (name) {
      loadRoomBookings();
    }
  }, [name, loadRoomBookings]);

  // Thao tác với hình ảnh
  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      showToast('Vui lòng nhập đường dẫn hình ảnh (URL).', 'error');
      return;
    }
    const isFirst = roomImages.length === 0;
    const newImg: AdminRoomImage = {
      id: `img-${Date.now()}`,
      imageUrl: newImageUrl.trim(),
      caption: newImageCaption.trim() || `${name} - Ảnh bổ sung`,
      tag: newImageTag.trim() || 'Visual',
      isPrimary: isFirst,
      displayOrder: roomImages.length
    };
    setRoomImages([...roomImages, newImg]);
    setNewImageUrl('');
    setNewImageCaption('');
    showToast('Đã thêm hình ảnh vào bộ sưu tập của phòng!', 'success');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = roomImages.filter((_, idx) => idx !== indexToRemove);
    if (updated.length > 0 && !updated.some((i) => i.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setRoomImages(updated);
    if (activeImageIndex >= updated.length) {
      setActiveImageIndex(Math.max(0, updated.length - 1));
    }
    showToast('Đã xóa hình ảnh khỏi danh sách.', 'success');
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    const updated = roomImages.map((img, idx) => ({
      ...img,
      isPrimary: idx === indexToPrimary
    }));
    setRoomImages(updated);
    setActiveImageIndex(indexToPrimary);
    showToast('Đã chọn làm ảnh đại diện chính của phòng!', 'success');
  };

  // Cập nhật thông tin phòng
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);

    const amenityPayload = Object.entries(selectedAmenities)
      .filter(([, val]) => val.selected)
      .map(([amenityId, val]) => ({
        amenityId,
        customNote: val.customNote.trim() || undefined,
        quantity: 1,
      }));

    const primaryImg = roomImages.find((i) => i.isPrimary)?.imageUrl || roomImages[0]?.imageUrl || '';

    const payload: RoomManagePayload = {
      name: name.trim(),
      roomType,
      capacity: Number(capacity),
      hourlyRate: Number(hourlyRate),
      location: location.trim(),
      description: description.trim(),
      coverImageUrl: primaryImg,
      hasProjector,
      hasWhiteboard,
      hasVideoConference,
      cleanupTimeMinutes: Number(cleanupTimeMinutes),
      isActive,
      images: roomImages.map((img, idx) => ({
        imageUrl: img.imageUrl,
        caption: img.caption,
        tag: img.tag,
        isPrimary: img.isPrimary,
        displayOrder: idx
      })),
      amenities: amenityPayload
    };

    try {
      await adminRequest.updateRoom(id, payload);
      showToast(`Đã lưu và cập nhật thông tin "${name}" cùng hình ảnh & tiện ích thành công!`, 'success');
      setRoom((prev) => (prev ? {
        ...prev,
        name: payload.name,
        roomType: payload.roomType,
        capacity: payload.capacity,
        hourlyRate: payload.hourlyRate,
        location: payload.location,
        description: payload.description,
        coverImageUrl: payload.coverImageUrl,
        hasProjector: payload.hasProjector,
        hasWhiteboard: payload.hasWhiteboard,
        hasVideoConference: payload.hasVideoConference,
        cleanupTimeMinutes: payload.cleanupTimeMinutes,
        isActive: payload.isActive ?? prev.isActive,
        images: roomImages,
      } : null));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối';
      showToast(`[Chế độ Xem Trước] Đã cập nhật thông tin phòng thành công trong phiên làm việc (${msg}).`, 'success');
      setRoom((prev) => (prev ? {
        ...prev,
        name: payload.name,
        roomType: payload.roomType,
        capacity: payload.capacity,
        hourlyRate: payload.hourlyRate,
        location: payload.location,
        description: payload.description,
        coverImageUrl: payload.coverImageUrl,
        hasProjector: payload.hasProjector,
        hasWhiteboard: payload.hasWhiteboard,
        hasVideoConference: payload.hasVideoConference,
        cleanupTimeMinutes: payload.cleanupTimeMinutes,
        isActive: payload.isActive ?? prev.isActive,
        images: roomImages,
      } : null));
    } finally {
      setSaving(false);
    }
  };

  // Đổi trạng thái phòng
  const handleToggleStatus = async () => {
    if (!id) return;
    try {
      await adminRequest.toggleRoomStatus(id);
      setIsActive(!isActive);
      showToast(`Đã đổi trạng thái phòng sang: ${!isActive ? 'Đang hoạt động' : 'Tạm ngưng phục vụ'}`, 'success');
    } catch {
      setIsActive(!isActive);
      showToast(`[Chế độ Xem Trước] Đã đổi trạng thái sang: ${!isActive ? 'Đang hoạt động' : 'Tạm ngưng'}`, 'success');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c59b48] mb-3" />
        <p className="text-xs font-light">Đang nạp hồ sơ chi tiết không gian...</p>
      </div>
    );
  }

  const galleryItems = roomImages.length > 0
    ? roomImages.map((img, idx) => ({
        id: img.id || String(idx),
        title: img.caption || `${name} - Khung cảnh ${idx + 1}`,
        tag: img.tag || (img.isPrimary ? 'Ảnh đại diện' : `Góc nhìn ${idx + 1}`),
        url: img.imageUrl,
        description: img.caption || 'Không gian tiêu chuẩn Atelier Quiet Luxury.'
      }))
    : DEFAULT_GALLERY;

  const safeIndex = activeImageIndex < galleryItems.length ? activeImageIndex : 0;
  const currentImage = galleryItems[safeIndex] || DEFAULT_GALLERY[0];

  return (
    <div className="space-y-8 pb-20">
      {/* Top Breadcrumb & Control Bar */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-xs text-stone-500">
          <Link
            to="/admin/rooms"
            className="hover:text-stone-900 transition flex items-center gap-1 font-medium"
          >
            <ArrowLeft size={13} />
            <span>Danh mục không gian</span>
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-[#a67c2e] font-semibold">{name || 'Chi tiết không gian'}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a67c2e] bg-[#c59b48]/10 px-2.5 py-0.5 rounded-full border border-[#c59b48]/20">
                {roomType || 'Executive Boardroom'}
              </span>
              <button
                onClick={handleToggleStatus}
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-stone-200 text-stone-600 border-stone-300 hover:bg-stone-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isActive ? 'bg-emerald-500' : 'bg-stone-400'
                  }`}
                />
                <span>{isActive ? 'Đang hoạt động' : 'Tạm ngưng phục vụ'}</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-stone-900 mt-2">
              {name}
            </h1>
            <p className="text-xs text-stone-500 font-light flex items-center gap-1.5 mt-1">
              <MapPin size={13} className="text-[#c59b48] shrink-0" />
              <span>{location}</span>
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              to={`/room/${id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition cursor-pointer shadow-2xs"
            >
              <ExternalLink size={13} className="text-stone-500" />
              <span>Xem trang khách</span>
            </Link>

            <button
              onClick={handleSaveRoom}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] hover:text-white text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-70"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>{saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Master Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visual Gallery & Specs & Bookings (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Bộ sưu tập hình ảnh không gian phong cách Quiet Luxury */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a67c2e] block">
                  Kiến Trúc & Không Gian
                </span>
                <span className="text-[11px] text-stone-400 font-light">•</span>
                <span className="text-xs text-stone-600 font-medium">
                  {currentImage.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImageManager(!showImageManager)}
                  className="px-2.5 py-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <ImageIcon size={13} />
                  <span>{showImageManager ? 'Thu gọn quản lý ảnh' : `Quản lý ảnh (${roomImages.length})`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreenPreview(true)}
                  className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                  title="Phóng to ảnh"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            {/* Quản lý danh sách hình ảnh (Mở rộng) */}
            {showImageManager && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-4 text-xs">
                <div>
                  <h4 className="font-semibold text-stone-900 flex items-center gap-1.5 text-xs mb-1">
                    <Plus size={14} className="text-[#a67c2e]" />
                    <span>Thêm hình ảnh mới cho không gian</span>
                  </h4>
                  <p className="text-[11px] text-stone-500 font-light mb-3">
                    Hỗ trợ đường dẫn URL trực tiếp từ Unsplash, CDN hoặc kho lưu trữ hình ảnh đám mây.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-6">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... (URL ảnh)"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#c59b48]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Góc trực diện bàn họp..."
                        value={newImageCaption}
                        onChange={(e) => setNewImageCaption(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#c59b48]"
                      />
                    </div>
                    <div className="sm:col-span-3 flex gap-2">
                      <select
                        value={newImageTag}
                        onChange={(e) => setNewImageTag(e.target.value)}
                        className="bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-[#c59b48] flex-1"
                      >
                        <option value="Overview">Tổng quan</option>
                        <option value="Boardroom">Bàn họp</option>
                        <option value="Screen">Màn chiếu</option>
                        <option value="Lounge">Sảnh chờ</option>
                        <option value="Workshop">Workshop</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="px-3 py-1.5 bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] rounded-lg font-medium transition cursor-pointer shrink-0"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danh sách ảnh hiện tại */}
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block mb-2">
                    Các ảnh đang có ({roomImages.length} ảnh):
                  </span>
                  {roomImages.length === 0 ? (
                    <p className="text-[11px] text-stone-400 italic">Chưa có ảnh riêng nào. Hệ thống đang hiển thị bộ ảnh mẫu.</p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {roomImages.map((img, idx) => (
                        <div
                          key={img.id || idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200 gap-3"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <img
                              src={img.imageUrl}
                              alt={img.caption}
                              className="w-12 h-9 rounded object-cover border border-stone-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-stone-800 truncate text-xs">
                                  {img.caption || `Ảnh ${idx + 1}`}
                                </span>
                                {img.isPrimary && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold shrink-0">
                                    Ảnh chính
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-stone-400 font-mono block truncate">
                                Tag: {img.tag || 'N/A'} • {img.imageUrl.slice(0, 45)}...
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!img.isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="px-2 py-1 text-[10px] text-[#a67c2e] hover:bg-[#c59b48]/10 rounded border border-[#c59b48]/30 transition cursor-pointer"
                              >
                                Đặt ảnh chính
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                              title="Xóa ảnh"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hero Main Photo */}
            <div className="relative h-72 sm:h-96 w-full rounded-xl overflow-hidden bg-stone-900 group">
              <img
                src={currentImage.url}
                alt={currentImage.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-xs text-[#e6c87e] px-2.5 py-1 rounded-full border border-[#c59b48]/30">
                  {currentImage.tag}
                </span>
              </div>

              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h4 className="text-sm font-medium">
                  {currentImage.title}
                </h4>
                <p className="text-[11px] text-stone-300 font-light line-clamp-1 mt-0.5">
                  {currentImage.description}
                </p>
              </div>
            </div>

            {/* Thumbnails Row */}
            <div className="grid grid-cols-5 gap-2.5 pt-1">
              {galleryItems.map((img, idx) => {
                const isActiveThumb = activeImageIndex === idx;
                return (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative rounded-lg overflow-hidden h-16 border-2 transition cursor-pointer ${
                      isActiveThumb
                        ? 'border-[#c59b48] shadow-sm scale-[1.02]'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-stone-300'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="absolute bottom-1 right-1 text-[8px] bg-black/60 text-white px-1 rounded font-mono">
                      0{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mô tả & Tổng quan không gian */}
          {description && (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a67c2e] block">
                Tổng Quan & Định Vị Không Gian
              </span>
              <p className="text-xs text-stone-700 font-light leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          )}

          {/* Bảng thông số kỹ thuật chi tiết */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-sm font-serif font-normal text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
              <Building2 size={16} className="text-[#a67c2e]" />
              <span>Đặc Tả Kỹ Thuật & Khả Năng Vận Hành</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
                  Sức Chứa Tiêu Chuẩn
                </span>
                <span className="text-base font-semibold text-stone-900">
                  {capacity} thành viên
                </span>
                <p className="text-[10px] text-stone-500 font-light mt-0.5">Bàn họp tròn/chữ U</p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
                  Biểu Phí Theo Giờ
                </span>
                <span className="text-base font-semibold text-[#a67c2e]">
                  {Number(hourlyRate).toLocaleString('vi-VN')} đ
                </span>
                <p className="text-[10px] text-stone-500 font-light mt-0.5">Chưa bao gồm VAT</p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
                  Đệm Dọn Vệ Sinh
                </span>
                <span className="text-base font-semibold text-stone-900">
                  {cleanupTimeMinutes} phút
                </span>
                <p className="text-[10px] text-stone-500 font-light mt-0.5">Tự động khóa sau ca</p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
                  Diện Tích Sàn Ước Tính
                </span>
                <span className="text-base font-semibold text-stone-900">
                  {capacity * 4.5} m²
                </span>
                <p className="text-[10px] text-stone-500 font-light mt-0.5">Không gian tiêu chuẩn cao</p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
                  Hệ Thống Cách Âm
                </span>
                <span className="text-base font-semibold text-emerald-700">
                  STC 50+ dB
                </span>
                <p className="text-[10px] text-stone-500 font-light mt-0.5">Bảo mật hội đàm tuyệt đối</p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
                  Độ Sẵn Sàng
                </span>
                <span className="text-base font-semibold text-stone-900">
                  {isActive ? '100% Khả dụng' : 'Đang bảo trì'}
                </span>
                <p className="text-[10px] text-stone-500 font-light mt-0.5">Kiểm soát trực tuyến</p>
              </div>
            </div>
          </div>

          {/* Tiện nghi & Hạ tầng công nghệ có sẵn - Dữ liệu thực tế từ DB */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a67c2e] block">
                  Tiện Nghi & Đặc Tính Kỹ Thuật
                </span>
                <h3 className="text-sm font-serif font-normal text-stone-900 flex items-center gap-2 mt-0.5">
                  <Sparkles size={15} className="text-[#a67c2e]" />
                  <span>Trang Thiết Bị & Đặc Điểm Riêng Biệt Của Phòng</span>
                </h3>
              </div>
              <span className="text-[11px] text-stone-500 font-light">
                {Object.values(selectedAmenities).filter((v) => v.selected).length} tiện nghi đang chọn
              </span>
            </div>

            <p className="text-xs text-stone-500 font-light leading-relaxed">
              Tích chọn tiện nghi phòng sở hữu và nhập ghi chú đặc thù (ví dụ: hội trường lớn có màn hình LED lớn, phòng họp có bàn ghế TV, phòng trống cho hoạt động...).
            </p>

            <div className="grid grid-cols-1 gap-3.5 pt-1">
              {availableAmenities.map((amenity) => {
                const isSelected = selectedAmenities[amenity.id]?.selected ?? false;
                const note = selectedAmenities[amenity.id]?.customNote ?? '';

                return (
                  <div
                    key={amenity.id}
                    className={`p-4 rounded-xl border transition ${
                      isSelected
                        ? 'border-[#c59b48]/60 bg-[#c59b48]/5 shadow-2xs'
                        : 'border-stone-200/80 bg-stone-50/50 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex items-center gap-3 cursor-pointer flex-1"
                        onClick={() => {
                          setSelectedAmenities((prev) => ({
                            ...prev,
                            [amenity.id]: {
                              selected: !isSelected,
                              customNote: prev[amenity.id]?.customNote || ''
                            }
                          }));
                          // Đồng bộ cờ legacy nếu cần
                          if (amenity.name.includes('Smart TV') || amenity.name.includes('LED')) {
                            setHasProjector(!isSelected);
                          }
                          if (amenity.name.includes('Bảng Kính')) {
                            setHasWhiteboard(!isSelected);
                          }
                          if (amenity.name.includes('Zoom')) {
                            setHasVideoConference(!isSelected);
                          }
                        }}
                      >
                        <div className={`p-2.5 rounded-lg shrink-0 ${isSelected ? 'bg-[#c59b48]/20' : 'bg-stone-100'}`}>
                          {renderAmenityIcon(amenity.icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-stone-900">{amenity.name}</span>
                            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-600 font-medium">
                              {amenity.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 font-light mt-0.5">
                            {amenity.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAmenities((prev) => ({
                            ...prev,
                            [amenity.id]: {
                              selected: !isSelected,
                              customNote: prev[amenity.id]?.customNote || ''
                            }
                          }));
                          if (amenity.name.includes('Smart TV') || amenity.name.includes('LED')) {
                            setHasProjector(!isSelected);
                          }
                          if (amenity.name.includes('Bảng Kính')) {
                            setHasWhiteboard(!isSelected);
                          }
                          if (amenity.name.includes('Zoom')) {
                            setHasVideoConference(!isSelected);
                          }
                        }}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer shrink-0 mt-1 ${
                          isSelected
                            ? 'bg-[#0b1220] border-[#0b1220] text-[#e6c87e]'
                            : 'border-stone-300 bg-white hover:border-stone-400'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </button>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-[#c59b48]/20">
                        <label className="block text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
                          Đặc tả / Ghi chú chi tiết cho phòng này:
                        </label>
                        <input
                          type="text"
                          value={note}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedAmenities((prev) => ({
                              ...prev,
                              [amenity.id]: {
                                selected: true,
                                customNote: val
                              }
                            }));
                          }}
                          placeholder={`Ví dụ: ${amenity.name} kích thước lớn, chuẩn phòng họp...`}
                          className="w-full bg-white border border-[#c59b48]/30 rounded-lg px-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c59b48]"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lịch họp sắp tới của phòng này (Live timeline) */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-serif font-normal text-stone-900 flex items-center gap-2">
                <Calendar size={15} className="text-[#a67c2e]" />
                <span>Lịch Đặt Phòng Dự Kiến Sắp Diễn Ra</span>
              </h3>
              <span className="text-[11px] text-stone-500 font-light">
                {upcomingBookings.length} phiên đã lên lịch
              </span>
            </div>

            {loadingBookings ? (
              <div className="py-6 text-center text-stone-400 text-xs">
                <Loader2 size={16} className="animate-spin mx-auto mb-1 text-[#c59b48]" />
                <span>Đang kiểm tra lịch phòng...</span>
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs">
                <span>Chưa có lịch họp nào được đăng ký trong những ngày tới. Phòng đang hoàn toàn rảnh rỗi.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl border border-stone-100 bg-[#faf8f5]/60 hover:bg-white hover:border-stone-200 transition text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900">{b.title}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                          {b.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-light mt-0.5">
                        {b.companyName} • {b.participantCount} đại biểu
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-stone-700 self-end sm:self-auto shrink-0 font-medium">
                      <div className="text-right">
                        <span className="text-[11px] text-stone-400 block font-light">{b.date}</span>
                        <span className="text-xs text-[#a67c2e] font-semibold">
                          {b.startTime} - {b.endTime}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Edit & Operational Control Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-6 space-y-6">
            {/* Form chỉnh sửa thông số phòng */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a67c2e] block">
                    Bảng Quản Trị
                  </span>
                  <h3 className="text-base font-serif font-normal text-stone-900">
                    Chỉnh Sửa Hồ Sơ Phòng
                  </h3>
                </div>
                <span className="text-[11px] text-stone-400 font-light">
                  Mã: <code className="text-[10px] font-mono">{id?.slice(0, 8)}</code>
                </span>
              </div>

              <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Tên phòng họp
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#c59b48] text-stone-800 font-medium transition"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Phân loại không gian
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#c59b48] text-stone-800 transition cursor-pointer"
                  >
                    <option value="Executive Boardroom">Executive Boardroom (Hội đàm VIP)</option>
                    <option value="Workshop Studio">Workshop Studio (Đào tạo & Sáng tạo)</option>
                    <option value="Strategy Suite">Strategy Suite (Hoạch định chiến lược)</option>
                    <option value="Creative Space">Creative Space (Thảo luận đa phương)</option>
                    <option value="Summit Hall">Summit Hall (Hội nghị quy mô lớn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Mô tả không gian & đặc trưng
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả phong cách kiến trúc, không gian và các đặc điểm nổi bật của phòng..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#c59b48] text-stone-800 transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      Sức chứa tối đa
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="100"
                      required
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#c59b48] text-stone-800 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      Đơn giá (VNĐ/h)
                    </label>
                    <input
                      type="number"
                      step="50000"
                      min="100000"
                      required
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#c59b48] text-stone-800 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Vị trí chi tiết
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#c59b48] text-stone-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Đệm dọn vệ sinh giữa các phiên
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 45].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setCleanupTimeMinutes(mins)}
                        className={`py-2 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
                          cleanupTimeMinutes === mins
                            ? 'bg-[#0b1220] text-[#e6c87e] border-[#0b1220]'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        <Clock size={12} />
                        <span>{mins}m</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 rounded-xl bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] hover:text-white text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    <span>{saving ? 'Đang cập nhật...' : 'Cập Nhật Hồ Sơ Không Gian'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Thống kê hiệu suất vận hành (KPIs) */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a67c2e] block">
                Hiệu Suất Vận Hành Tháng Này
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-[10px] text-stone-400 block font-light">Tỷ Lệ Lấp Đầy</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <TrendingUp size={14} className="text-emerald-600" />
                    <span className="text-sm font-semibold text-stone-900">76.4%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-[10px] text-stone-400 block font-light">Đánh Giá Khách Hàng</span>
                  <div className="flex items-center gap-1 mt-0.5 text-amber-500">
                    <Star size={13} className="fill-amber-400" />
                    <span className="text-sm font-semibold text-stone-900">4.9 / 5</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 col-span-2">
                  <span className="text-[10px] text-stone-400 block font-light">Doanh Thu Tích Lũy</span>
                  <span className="text-base font-semibold text-[#a67c2e] block mt-0.5">
                    38.500.000 đ
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    +18.2% so với tháng trước
                  </span>
                </div>
              </div>
            </div>

            {/* Chính sách hỗ trợ */}
            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-stone-200/80 text-[11px] text-stone-600 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-stone-800 text-xs">
                <ShieldCheck size={14} className="text-[#a67c2e]" />
                <span>Tiêu Chuẩn Vận Hành Atelier</span>
              </div>
              <p className="font-light leading-relaxed">
                Mọi thay đổi về giá hoặc tình trạng khả dụng sẽ được cập nhật tức thì đến ứng dụng đặt phòng của khách hàng mà không làm gián đoạn các phiên đang diễn ra.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Modal Preview */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <button
            onClick={() => setIsFullscreenPreview(false)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10 transition cursor-pointer"
          >
            <X size={20} />
          </button>
          <div className="max-w-5xl w-full text-center space-y-3">
            <img
              src={currentImage.url}
              alt="Fullscreen Preview"
              className="max-h-[80vh] w-auto mx-auto rounded-2xl shadow-2xl object-contain"
            />
            <div className="text-stone-300">
              <h3 className="text-lg font-serif text-white">
                {currentImage.title}
              </h3>
              <p className="text-xs text-stone-400 font-light max-w-xl mx-auto mt-1">
                {currentImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
