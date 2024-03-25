
    use nom::bytes::complete::{tag, take};
    use nom::number::complete::*;
    use nom::IResult;

    use std::io::Read;
    use std::path::Path;
    use std::path::PathBuf;

    mod structs;
    use structs::{
        PngHeader,
        PngChunk
    };

    fn read_png_header(input: &[u8]) -> IResult<&[u8], PngHeader> {
        let (input, header) = tag(b"\x89\x50\x4e\x47\x0d\x0a\x1a\x0a")(input)?;
        let (input, _) = be_u32(input)?;
        let (input, ihdr) = tag(b"IHDR")(input)?;
        let (input, width) = be_u32(input)?;
        let (input, height) = be_u32(input)?;
        let (input, bits_per_pixel) = be_u8(input)?;
        let (input, color_type) = be_u8(input)?;
        let (input, compression_method) = be_u8(input)?;
        let (input, filter_method) = be_u8(input)?;
        let (input, interlace_method) = be_u8(input)?;
        let (input, _) = be_u32(input)?; // crc
        Ok((input, PngHeader {
            header,
            ihdr,
            width,
            height,
            bits_per_pixel,
            color_type,
            compression_method,
            filter_method,
            interlace_method
        }))
    }

    fn read_png_chunk(input: &[u8]) -> IResult<&[u8], PngChunk> {
        let _byte4: u32 = 4;
        let (input, data_length) = be_u32(input)?;
        let (input, chunk_name) = take(4u8)(input)?;
        let (input, chunk_data) = take(data_length)(input)?;
        let (input, _) = be_u32(input)?;
        Ok((input, PngChunk {
            data_length,
            chunk_name,
            chunk_data,
        }))
    }

    fn read_file<P: AsRef<Path>>(file_path: P) -> Vec<u8> {
        let mut file = std::fs::File::open(file_path).expect("file open failed");
        let mut buf = Vec::new();
        file.read_to_end(&mut buf).expect("file read fialed");
        buf
    }

    fn get_metadata(data: &[u8]) -> String {
        let mut inner_remain = data;
        match read_png_header(&data) {
            Ok((remain, _)) => {
                inner_remain = remain;
            }
            Err(_) => {
                println!("did not read header.");
                return "did not read header.".to_string();
            }
        }
        loop {
            match read_png_chunk(&mut inner_remain) {
                Ok((remain, chunk)) => {
                    // println!("chunk size: {:#X?}", chunk.data_length);
                    // println!("chunk name: {:#X?}", chunk.chunk_name);
                    if chunk.chunk_name == b"tEXt" || chunk.chunk_name == b"iTXt" {
                        let converted: String = String::from_utf8(chunk.chunk_data.to_vec())
                                                        .unwrap()
                                                        .replace("\0", " ");
                        println!("data: {}", converted);
                        return converted;
                    }
                    if chunk.chunk_name == b"IEND" {
                        break "NO METADATA".to_string();
                    }
                    inner_remain = remain; //更新
                }
                Err(_) => {
                    println!("did not read chunk.")
                }
            }
        }
    }

    pub fn read_png(path: PathBuf) -> String {
        println!("path: {:?}", path);
        let data = read_file(path);
        get_metadata(&data)
    }


