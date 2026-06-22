import React from 'react'

function ProjectFilter({ search, setSearch, locationFilter, setLocationFilter, sortBy, setSortBy }) {
  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '20px auto',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,.05)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {/* 1. TÌM KIẾM THEO TÊN (Search) */}
      <div style={{ flex: '1', minWidth: '250px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4b5563' }}>🔎 Tìm kiếm công trình</label>
        <input
          type="text"
          placeholder="Nhập tên dự án (Biệt thự, nhà phố...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* 2. LỌC THEO KHU VỰC (Filter) */}
      <div style={{ minWidth: '200px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4b5563' }}>📍 Lọc theo địa điểm</label>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
        >
          <option value="All">Tất cả khu vực</option>
          <option value="Quận 2">Quận 2</option>
          <option value="Bình Thạnh">Bình Thạnh</option>
        </select>
      </div>

      {/* 3. SẮP XẾP THEO TÊN (Sort) */}
      <div style={{ minWidth: '200px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4b5563' }}>🔀 Sắp xếp theo tên</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
        >
          <option value="None">Mặc định</option>
          <option value="AZ">Từ A đến Z</option>
          <option value="ZA">Từ Z đến A</option>
        </select>
      </div>
    </div>
  )
}

export default ProjectFilter