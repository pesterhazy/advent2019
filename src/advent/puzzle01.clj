(ns advent.puzzle01)

(defn fuel [mass] (-> mass (quot 3) (- 2) (Math/max 0)))

(defn fuel* [mass]
  (->> (iterate fuel mass) (drop 1) (take-while pos?) (apply +)))

(def numbers
  (->> (clojure.java.io/reader "inputs/1.txt")
       line-seq
       (map #(Long/parseLong %))))

(defn solution []
  (->> (map fuel numbers) (apply +)))

(defn solution-2 []
  (->> (map fuel* numbers) (apply +)))
