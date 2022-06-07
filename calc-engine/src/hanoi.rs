pub fn hanoi(n: usize, pos_start: usize, pos_end: usize) -> Vec<(usize, usize)> {
    if n == 1 {
        vec![(pos_start, pos_end)]
    } else {
        let pos_middle = *vec![0, 1, 2]
            .iter()
            .filter(|e| **e != pos_start && **e != pos_end)
            .last()
            .unwrap();
        vec![
            hanoi(n - 1, pos_start, pos_middle),
            vec![(pos_start, pos_end)],
            hanoi(n - 1, pos_middle, pos_end),
        ]
        .concat()
    }
}

fn apply_moves(s: &mut [Vec<u32>; 3], moves: &Vec<(usize, usize)>) {
    moves.iter().for_each(|(start, end)| {
        let e = s[*start].remove(0);
        s[*end].insert(0, e);
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hanoi() {
        let moves = hanoi(10, 0, 2);
        let mut s = [vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10], vec![], vec![]];
        apply_moves(&mut s, &moves);
        assert_eq!(s, [vec![], vec![], vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]);
    }
}
