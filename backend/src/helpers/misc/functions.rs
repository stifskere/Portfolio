use std::ops::Range;

pub fn in_range<T: PartialOrd>(value: T, range: Range<T>) -> bool {
    value >= range.start && value <= range.end
}
