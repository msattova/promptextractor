
pub struct PngHeader<'a> {
    pub header: &'a [u8],
    pub ihdr: &'a [u8],
    pub width: u32,
    pub height: u32,
    pub bits_per_pixel: u8,
    pub color_type: u8,
    pub compression_method: u8,
    pub filter_method: u8,
    pub interlace_method: u8,
}

pub struct PngChunk<'a> {
    pub data_length: u32,
    pub chunk_name: &'a [u8],
    pub chunk_data: &'a [u8],
}
