(ns advent.puzzle01)

(defn fuel [mass] (-> mass (quot 3) (- 2)))

(def numbers
  (->> (clojure.java.io/reader "inputs/1.txt")
       line-seq
       (map #(Long/parseLong %))))

(defn result []
  (->> (map fuel numbers) (apply +)))
